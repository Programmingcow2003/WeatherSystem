function sampleData(voltage, amount) {
  let result = [];
  let sample = [];

  //Sets the amount it will send (if sample is too small won't send)
  amount = Math.min(amount, sample.length);

  //Pictures a random set of the numbers
  for (let i = 0; i < amount; i++) {
    let index = Math.floor(Math.random() * sample.length);

    //Puts the results and gets a certain amount of samples
    result.push(sample[index]);
    sample.splice(index, 1);
  }

  return result;
}

module.exports = sampleData;