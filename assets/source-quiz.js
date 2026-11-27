const check = document.querySelector("[data-check-quiz]");
if (check) {
  const groups = Array.from(document.querySelectorAll(".source-radio-group[data-answer]"));
  const score = document.querySelector("[data-quiz-score]");
  const showAll = document.querySelector("[data-show-answers]");
  const reset = document.querySelector("[data-reset-quiz]");
  const answerSheet = document.querySelector(".answer-sheet");

  function clearMark(group) {
    for (const label of group.querySelectorAll("label")) {
      label.removeAttribute("data-correct");
      label.removeAttribute("data-incorrect");
    }
    const verdict = group.parentElement.querySelector(".quiz-verdict");
    verdict.hidden = true;
    verdict.removeAttribute("data-result");
    verdict.textContent = "";
  }

  function grade(revealAll) {
    let answered = 0;
    let correct = 0;
    for (const group of groups) {
      const picked = group.querySelector("input:checked");
      const right = picked?.value === group.dataset.answer;
      const reveal = Boolean(picked) || revealAll;
      if (picked) answered++;
      if (right) correct++;
      const item = group.parentElement;
      const verdict = item.querySelector(".quiz-verdict");
      verdict.hidden = false;
      verdict.dataset.result = picked ? (right ? "right" : "wrong") : "empty";
      const chosenIndex = Array.from(group.querySelectorAll("input")).indexOf(picked);
      verdict.textContent = picked
        ? (right ? "回答正确" : "回答有误") + "　你的选择 " + String.fromCharCode(65 + chosenIndex)
        : "未作答";
      for (const input of group.querySelectorAll("input")) {
        const label = input.closest("label");
        label.toggleAttribute("data-correct", reveal && input.value === group.dataset.answer);
        label.toggleAttribute("data-incorrect", Boolean(picked) && input.checked && !right);
      }
      item.querySelector(".quiz-explanation").open = reveal;
    }
    score.hidden = false;
    score.textContent = "得分 " + correct + " / " + groups.length + "　已答 " + answered + " 题　未答 " + (groups.length - answered) + " 题";
  }

  for (const group of groups) {
    group.addEventListener("change", () => {
      clearMark(group);
      group.parentElement.querySelector(".quiz-explanation").open = false;
      score.hidden = true;
    });
  }
  check.addEventListener("click", () => grade(false));
  showAll.addEventListener("click", () => grade(true));
  reset.addEventListener("click", () => {
    for (const group of groups) {
      for (const input of group.querySelectorAll("input")) input.checked = false;
      clearMark(group);
      group.parentElement.querySelector(".quiz-explanation").open = false;
    }
    if (answerSheet) answerSheet.open = false;
    score.textContent = "";
    score.hidden = true;
  });
}
