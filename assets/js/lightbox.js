// Open the Modal
function openModal(i) {
  var idName = "myModal-product".concat(i);
  document.getElementById(idName).style.display = "block";
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  nav.style.zIndex = '0';
  header.style.zIndex = '0';

}

// Close the Modals
function closeModal(i) {
  var idName = "myModal-product".concat(i);
  document.getElementById(idName).style.display = "none";
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  nav.style.zIndex = 'auto';
  header.style.zIndex = '10';
}

// start all product slides
var slideIndex = 1;
showSlides(slideIndex, 1);
showSlides(slideIndex, 2);
showSlides(slideIndex, 3);
showSlides(slideIndex, 4);


// Next/previous controls
function plusSlides(n, productNum) {
  showSlides(slideIndex += n, productNum);
}

// Thumbnail image controls
function currentSlide(n, productNum) {
  slideIndex = n;
  showSlides(slideIndex, productNum);
}

// n : current slide index
// productNum : current product index
function showSlides(n, productNum) {
  var i;
  var slideCall = "mySlides-product".concat(productNum);
  var demoCall = "demo-product".concat(productNum);
  var slides = document.getElementsByClassName(slideCall);
  var dots = document.getElementsByClassName(demoCall);
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}
