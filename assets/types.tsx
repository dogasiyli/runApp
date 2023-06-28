export type PositionDict = {
    ts?: {
      initial?: number;
      final?: number;
    };
    loc?: any[];
    diff_arr?: any[];
  };

export type GeodesicResult = {
  s_geo_len: number,
  α1: number,
  α2: number,
  pace: number,
  kmh: number,
  time_diff: number,
}

export type CoveredDistance = {
  distance_all: number,
  distance_last: number,
  time_diff_last: number,
  dist_to_start: number
}