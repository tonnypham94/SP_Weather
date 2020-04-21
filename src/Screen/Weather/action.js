const getBezierXY = (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) => {
  return {
    x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x 
    + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
    y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y 
    + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
  }
}

const exportFunctions = {
  getBezierXY
}

export default exportFunctions