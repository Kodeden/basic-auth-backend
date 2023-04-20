export default function (
  err,
  _,
  res,

  // Express demands that we have 4th parameter ('next'), even if not used!
  __
) {
  res.status(400).json({ error: err.message });
}
