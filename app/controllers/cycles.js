const cycleHelper = require('../helpers/cycles')

exports.list = (req, res) => {
  const isRollover = process.env.IS_ROLLOVER

  if (isRollover === 'true') {
    res.render('../views/cycles/list', {})
  } else {
    const cycleId = cycleHelper.CURRENT_CYCLE.code || req.params.cycleId
    res.redirect(`/cycles/${cycleId}/organisations`);
  }
}
