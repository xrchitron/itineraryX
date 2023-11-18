const dateMethods = {
  toISOString: dateStr => {
    const dateObj = new Date(dateStr)
    const isoStr = dateObj.toISOString()
    const finalStr = isoStr.split('.')[0] + 'Z'
    return finalStr
  },
  toISOStringInDB: dateStr => {
    const dateObj = new Date(dateStr)
    console.log(dateObj)
    const isoStr = dateObj.toISOString()

    return isoStr
  }
}
module.exports = dateMethods
