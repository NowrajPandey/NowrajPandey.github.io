$(document).ready(function () {
  const keyboard = $(".keyboard");

  if (keyboard.length !== 1) {
    console.error("There must be exactly ONE .keyboard element");
    return;
  }

  keyboard.empty();

  const keys = [
    { note: "C", black: false },
    { note: "C#", black: true },
    { note: "D", black: false },
    { note: "D#", black: true },
    { note: "E", black: false },
    { note: "F", black: false },
    { note: "F#", black: true },
    { note: "G", black: false },
    { note: "G#", black: true },
    { note: "A", black: false },
    { note: "A#", black: true },
    { note: "B", black: false },
  ];

  keys.forEach((k) => {
    const key = $("<div></div>")
      .addClass("key")
      .addClass(k.black ? "key-black" : "key-white")
      .attr("data-note", k.note);

    keyboard.append(key);
  });
});
