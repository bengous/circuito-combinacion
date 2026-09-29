# 0006. Dimensionnement : chute de tension, tableaux et écarts entre normes

- Statut : acceptée
- Date : 2026-09-29

## Contexte

validelec (ADR 0005) vérifie aussi le dimensionnement d'un circuit tel qu'il est posé :
section, disjoncteur, chute de tension. Ces règles lisent une `Installation` : le circuit,
plus la tension, le disjoncteur, la section et la longueur de chaque conducteur, la charge
de la lampe, la température ambiante, le nombre de circuits dans la gaine et le tableau
d'où part le circuit. `CircuitDefinition` ne change pas.

Trois points ne se déduisent pas des textes :

- l'AEA 90364-7-771 (771.19.7) donne trois méthodes de chute de tension. a) est la formule
  de l'IEC 60364-5-52 (annexe G), sans résistance ni réactance : elle renvoie au fabricant
  ou à l'IEC 60287. b) (tableau 771.19.IV) et c) (expression GDC) sont fixées à
  cos φ = 0,80 ;
- 771.19.7 place 66 % de la charge d'éclairage au bout du circuit, 771.13 b) sa demande
  maximale ;
- les tableaux des deux normes n'ont pas les mêmes lignes : le groupement AEA s'arrête à
  3 circuits, celui de l'IEC va jusqu'à 20.

## Décision

- **Chute de tension** : une seule formule pour les deux normes, sur les conducteurs
  réellement parcourus par le courant, dans la pire position où la lampe est allumée :
  ΔU = I · Σ (ρ · L / S · cos φ + λ · L · sin φ), avec I = P / (U · cos φ). Chaque
  conducteur compte sa propre longueur : la phase et le neutre sont deux conducteurs du
  modèle. Les constantes sont celles de l'annexe G de l'IEC pour les deux normes :
  ρ₁ = 0,0225 Ω·mm²/m, λ = 0,08 mΩ/m. Pour une lampe (cos φ = 1, ou plus de 0,9 pour une
  LED), le tableau AEA b) sous-estime la chute d'environ 13 % (26 V/(A·km) pour 1,5 mm²,
  contre 30).
- **Charge** : toute la puissance de la lampe, là où elle est. Le 66 % décrit des points
  d'éclairage répartis ; le modèle a une seule lampe, placée au bout.
- **Tableaux** : une valeur absente lève une erreur, sans interpolation (température entre
  deux lignes, 4 circuits dans une gaine en AEA, section hors tableau). Un conducteur sous
  la section minimale a son propre constat et n'est pas passé au contrôle de I_Z.
- **Une règle par sujet** : I_B ≤ I_n ≤ I_Z devient `breaker-under-load` (le circuit) et
  `cable-over-breaker` (un conducteur). Les 9 règles prévues deviennent 10 identifiants.
- **Écarts entre normes** : les règles tournent pour la norme choisie et pour chaque autre
  norme dont les tableaux couvrent l'installation. La norme choisie décide de la gravité.
  Chaque problème liste dans `elsewhere` les normes qui jugent autrement (autre gravité,
  valeur dans leurs limites, ou pas de règle). Un constat que seule une autre norme fait
  devient un problème `info`.

| Règle                    | AEA                                      | IEC                                 |
| ------------------------ | ---------------------------------------- | ----------------------------------- |
| `min-section`            | 1,5 mm², `error`, 771.13, Tabla 771.13.I | 1,5 mm², `error`, 60364-5-52, 524.1 |
| `breaker-under-load`     | `error`, 771.19.2.1                      | `error`, 60364-4-43:2023, 431.4.2   |
| `cable-over-breaker`     | `error`, 771.19.2.1                      | `error`, 60364-4-43:2023, 431.4.2   |
| `lighting-breaker-cap`   | 16 A, `error`, 771.7.6 a) I              | pas de règle                        |
| `voltage-drop`           | 3 %, `error`, 771.13 b)                  | 3 %, `warning`, 60364-5-52, G.52.1  |
| `sub-board-voltage-drop` | 2 %, `warning`, 771.13 b), nota          | pas de règle                        |

I_Z vient de la Tabla 771.16.I (40 °C) et des Tablas 771.16.II.a et b pour l'AEA, des
tableaux B.52.2 (colonne B1, 30 °C), B.52.14 et B.52.17 (item 1) pour l'IEC : conducteurs
PVC en cuivre sous conduit, deux conducteurs chargés.

## Conséquences

- Sous cos φ ≈ 0,87, l'annexe G donne moins de chute que le tableau AEA (24,1 contre
  26 V/(A·km) à cos φ = 0,80). `powerFactor` est une saisie libre : un moteur ou un tube
  mal compensé serait jugé un peu moins sévèrement qu'avec le tableau.
- Le contrôle I_2 ≤ 1,45 · I_Z n'est pas fait : il découle de I_n ≤ I_Z pour un disjoncteur
  IEC 60898 (771.19.3 e).
- Une seule lampe par installation : plusieurs lampes demanderaient le courant de chaque
  conducteur, que `solve()` ne donne pas.
- Non vérifié : l'amendement 1 (2024) de l'IEC 60364-5-52 change-t-il ces tableaux ? Seul le
  sommaire de l'édition 3.1 a été lu.
- TODO : l'AEA limite-t-elle le nombre de circuits dans un même caño (771.12, non lu) ? Si
  oui, 4 circuits serait une infraction, pas une valeur absente d'un tableau.
