function bindSlider(sliderId, valueId, variableName, step = 1, decimals = 0) {
  const slider = document.getElementById(sliderId);
  const valSpan = document.getElementById(valueId);

  function formatValue(raw) {
    let value = raw * step;
    return parseFloat(value.toFixed(decimals));
  }

  let value = formatValue(parseFloat(slider.value));
  valSpan.innerText = value;
  window[variableName] = value;

  slider.addEventListener('input', () => {
    let newValue = formatValue(parseFloat(slider.value));
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
bindSlider("speedSliderStart", "speedValStart", "SPEED", 0.15, 2); // ← دو رقم اعشار
bindSlider("roundTimeSliderStart", "roundTimeValStart", "roundTime");
bindSlider("maxWallBouncesSliderStart", "maxWallBouncesValStart", "maxWallBounces");
