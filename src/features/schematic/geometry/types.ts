import type { TerminalId } from '@/domain/circuit';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DeviceGeometry {
  /** Outline of the switch body. */
  readonly body: Box;
  /** Where the device name is written (state goes below). */
  readonly label: Point;
  /** Area that reacts to a tap: the body and its label. */
  readonly hitArea: Box;
}

export interface TextMark {
  readonly text: string;
  readonly at: Point;
  readonly anchor: 'start' | 'middle' | 'end';
}

/** Everything the renderer needs to know about where things are, in SVG user units. */
export interface SchematicGeometry {
  readonly width: number;
  readonly height: number;
  readonly terminals: ReadonlyMap<TerminalId, Point>;
  readonly devices: ReadonlyMap<string, DeviceGeometry>;
  readonly lamp: { readonly center: Point; readonly radius: number; readonly label: Point };
  readonly sources: {
    readonly phase: { readonly at: Point; readonly label: Point };
    readonly neutral: { readonly at: Point; readonly label: Point };
  };
  readonly bridgeLabels: readonly TextMark[];
}
