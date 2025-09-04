
function bindSlider(sliderId, valueId, variableName) {
  const slider = document.getElementById(sliderId);
  const valSpan = document.getElementById(valueId);

  valSpan.innerText = slider.value;
  window[variableName] = parseFloat(slider.value);

  slider.addEventListener('input', () => {
    const newValue = parseFloat(slider.value);
    valSpan.innerText = newValue;        
    window[variableName] = newValue;    
updateAllShapesSize(); 

    console.log(
      "shapeSize =", shapeSize,
      "MAX_SHAPES =", MAX_SHAPES,
      "SPEED =", SPEED,
      "roundTime =", roundTime,
      "maxWallBounces =", maxWallBounces
    );
  });
}

bindSlider("SizeSliderStart", "SizeValStart", "shapeSize");
bindSlider("maxShapesSliderStart", "maxShapesValStart", "MAX_SHAPES");
bindSlider("speedSliderStart", "speedValStart", "SPEED");
bindSlider("roundTimeSliderStart", "roundTimeValStart", "roundTime");
bindSlider("maxWallBouncesSliderStart", "maxWallBouncesValStart", "maxWallBounces");


