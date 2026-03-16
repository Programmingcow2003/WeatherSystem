function sampleData(voltage, amount) 
{
  let result = [];
  let sample = [...voltage];

  //Sets the amount it will send (if sample is too small won't send extra to cause it to break)
  let number_to_choose = Math.min(amount, sample.length);

  //Picks a random set of the numbers
  for (let i = 0; i < number_to_choose; i++) 
  {
    let random_choice = Math.floor(Math.random() * sample.length);

    //Puts the results and gets a certain amount of samples
    result.push(sample[random_choice]);
    sample.splice(random_choice, 1);
  }

  return result;
}

module.exports = sampleData;