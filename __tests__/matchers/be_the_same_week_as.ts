import moment from 'moment'

expect.extend({
  toBeTheSameWeekAs(received, expected) {
    const fields = ['weekOfYear', 'weekOfMonth', 'weekOfQuarter','monthOfYear', 'quarterOfYear' ]
    const dates = ['gregorianStartDate', 'gregorianEndDate']

    let unmatched = fields.map(f => {
      if(received[f] != expected[f])
        return { field: f, expected: expected[f], actual: received[f] }
      
      return null
    })

    if(received["gregorianStartDate"].getTime() !== moment(expected["gregorianStartDate"]).toDate().getTime())
      unmatched.push({ field: "gregorianStartDate", expected: expected["gregorianStartDate"], actual: received["gregorianStartDate"]})

    if(received["gregorianEndDate"].getTime() !== moment(expected["gregorianEndDate"]).endOf('day').toDate().getTime())
      unmatched.push({ field: "gregorianEndDate", expected: expected["gregorianEndDate"], actual: received["gregorianEndDate"]})

    unmatched = unmatched.filter(f => f !== null)

    if (unmatched.length == 0) {
      return {
        message: () =>
          `expected ${received} to have some fields that don't match with expected`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected week ${expected.weekOfYear} to have fields that match with expected, however these don't:\n${unmatched.map(u => `'${u?.field}' e: ${u?.expected} a: ${u?.actual}`).join('\n')}\nreceived: ${JSON.stringify(received)}`,
        pass: false,
      };
    }
  },
});