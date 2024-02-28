function Masking(value) {

    if(value.length <= 2) {

    }

    const middleIndex = Math.floor(value.length / 2);

    const maskedNameArray = value.split('');
    maskedNameArray[middleIndex] = '*';

    return maskedNameArray.join('');
}

export default Masking;