// Generate a random slug (containing only letters)
// 'length' is the number of generated characters
function slug_generator(length = 5) {
  var temp_slug = "";
  for (i = 0; i < length; i++) {
    const random_num = Math.floor(Math.random() * 24) + 65;
    //console.log(random_num);
    temp_slug += String.fromCharCode(random_num);
  }
  return temp_slug.toLowerCase();
}

module.exports = { slug_generator };
