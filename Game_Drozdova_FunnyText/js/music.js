document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-music");
  const toggleBtn = document.getElementById("music-toggle");
  const volumeSlider = document.getElementById("music-volume");

  if (!audio || !toggleBtn || !volumeSlider) return;

  audio.volume = volumeSlider.value;

  toggleBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      toggleBtn.classList.remove("play");
      toggleBtn.classList.add("pause");
    } else {
      audio.pause();
      toggleBtn.classList.remove("pause");
      toggleBtn.classList.add("play");
    }
  });

  volumeSlider.addEventListener("input", () => {
    const v = parseFloat(volumeSlider.value);

    if (v === 0) {
      audio.muted = true;
    } else {
      audio.muted = false;
      audio.volume = v;
    }
  });
});
