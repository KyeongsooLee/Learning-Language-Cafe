function addOrDeleteToUniqueArray(array, number) {
    let increaseExp = false;
    if (!array.includes(number)) {
      array.push(number);
      increaseExp = true;
    } else {
      const index = array.indexOf(number);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }

    return increaseExp;
}

function printNumbers(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) { count++; }
    console.log("Total number: ", count);
    return count;
}

function upExp(userLevel, userExp) {
    let newExp = userExp + 25;
    let newLevel = userLevel;
  
    if (newExp >= 100) {
      newExp = newExp - 100;
      newLevel = userLevel + 1;
    }
    
    return { userLevel: newLevel, userExp: newExp };
}

function downExp(userLevel, userExp) {
    let newExp = userExp - 25;
    let newLevel = userLevel;
  
    if (newExp < 0) {
      newExp = newExp + 100;
      newLevel = userLevel - 1;
    }
    
    return { userLevel: newLevel, userExp: newExp };
}

module.exports = {
    addOrDeleteToUniqueArray,
    printNumbers,
    upExp,
    downExp
};