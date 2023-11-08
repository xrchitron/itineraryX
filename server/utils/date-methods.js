const dateMethods = {
  toISOString: dateStr => {
    const dateObj = new Date(dateStr)
    const isoStr = dateObj.toISOString()
    const finalStr = isoStr.split('.')[0] + 'Z'
    return finalStr
  }
}
module.exports = dateMethods
