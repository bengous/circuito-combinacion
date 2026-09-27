import type { CircuitDefinition, Device, TerminalId } from '@/domain/circuit';
import { terminalOf } from '@/domain/circuit';
import type { DeviceGeometry, Point, SchematicGeometry, TextMark } from './types';

/** Vertical chain, top to bottom: phase, switches, lamp, neutral. Units are SVG user units. */
const G = {
  width: 330,
  axisX: 96,
  top: 16,
  lead: 22,
  bridgeGap: 36,
  bridgeHalf: 26,
  bodyWidth: 82,
  bodyPad: 8,
  combinacionHeight: 50,
  cruceHeight: 58,
  returnLength: 26,
  lampRadius: 19,
  neutralLead: 24,
  bottom: 12,
  labelGap: 16,
} as const;

const at = (x: number, y: number): Point => ({ x, y });

function stageTerminals(device: Device, isFirst: boolean, y0: number, y1: number) {
  const { axisX: x, bridgeHalf: d } = G;
  const t = (name: string, p: Point): [TerminalId, Point] => [terminalOf(device.id, name), p];
  if (device.kind === 'cruce') {
    return [
      t('inA', at(x - d, y0)),
      t('inB', at(x + d, y0)),
      t('outA', at(x - d, y1)),
      t('outB', at(x + d, y1)),
    ];
  }
  // The first switch takes the phase on its common; the last one gives it to the lamp.
  return isFirst
    ? [t('common', at(x, y0)), t('a', at(x - d, y1)), t('b', at(x + d, y1))]
    : [t('a', at(x - d, y0)), t('b', at(x + d, y0)), t('common', at(x, y1))];
}

function deviceGeometry(y0: number, y1: number): DeviceGeometry {
  const { axisX, bodyWidth, bodyPad, labelGap, width } = G;
  const body = {
    x: axisX - bodyWidth / 2,
    y: y0 - bodyPad,
    width: bodyWidth,
    height: y1 - y0 + 2 * bodyPad,
  };
  const center = (y0 + y1) / 2;
  return {
    body,
    label: at(axisX + bodyWidth / 2 + labelGap, center - 6),
    hitArea: { x: body.x - 12, y: body.y - 8, width: width - body.x - 4, height: body.height + 16 },
  };
}

function bridgeLabels(y: number): TextMark[] {
  return [
    { text: 'A', at: at(G.axisX - G.bridgeHalf - 10, y + 4), anchor: 'end' },
    { text: 'B', at: at(G.axisX + G.bridgeHalf + 10, y + 4), anchor: 'start' },
  ];
}

export function layoutChain(circuit: CircuitDefinition): SchematicGeometry {
  const byId = new Map(circuit.devices.map((d) => [d.id, d]));
  const order = circuit.layout.order.map((id) => {
    const device = byId.get(id);
    if (!device) throw new Error(`Layout of "${circuit.id}" names unknown device "${id}"`);
    return device;
  });

  const terminals = new Map<TerminalId, Point>([[circuit.phase, at(G.axisX, G.top)]]);
  const devices = new Map<string, DeviceGeometry>();
  const labels: TextMark[] = [];
  let y = G.top + G.lead;
  order.forEach((device, index) => {
    const height = device.kind === 'cruce' ? G.cruceHeight : G.combinacionHeight;
    for (const [id, point] of stageTerminals(device, index === 0, y, y + height)) {
      terminals.set(id, point);
    }
    devices.set(device.id, deviceGeometry(y, y + height));
    y += height;
    if (index < order.length - 1) {
      labels.push(...bridgeLabels(y + G.bridgeGap / 2));
      y += G.bridgeGap;
    }
  });

  const lampCenter = at(G.axisX, y + G.returnLength + G.lampRadius);
  const neutral = at(G.axisX, lampCenter.y + G.lampRadius + G.neutralLead);
  for (const lamp of circuit.lamps) {
    terminals.set(lamp.input, at(G.axisX, lampCenter.y - G.lampRadius));
    terminals.set(lamp.output, at(G.axisX, lampCenter.y + G.lampRadius));
  }
  terminals.set(circuit.neutral, neutral);

  const labelX = G.axisX + G.labelGap;
  return {
    width: G.width,
    height: neutral.y + G.bottom,
    terminals,
    devices,
    lamp: {
      center: lampCenter,
      radius: G.lampRadius,
      label: at(G.axisX + G.lampRadius + 14, lampCenter.y + 5),
    },
    sources: {
      phase: { at: at(G.axisX, G.top), label: at(labelX, G.top + 5) },
      neutral: { at: neutral, label: at(labelX, neutral.y + 5) },
    },
    bridgeLabels: labels,
  };
}
