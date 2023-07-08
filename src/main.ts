import { vm01 } from "./vm";

const inputElement = document.getElementById("input") as HTMLInputElement;
const outputElement = document.getElementById("output") as HTMLInputElement;
const historiesElement = document.getElementById(
  "histories",
) as HTMLUListElement;

const virtualMachine = new vm01.PostfixCalculator();

/** VMを呼び出す */
const useVirtualMachine = () => {
  try {
    const input = inputElement.value;
    const output: number = virtualMachine.execute(input);
    outputElement.value = String(output);
  } catch (e) {
    if (e instanceof Error) {
      outputElement.value = e.message;
      console.error(e.message);
    }
  }
};

/** 履歴を残す */
const addHistory = () => {
  const input = inputElement.value;
  const output = outputElement.value;
  const li = document.createElement("li");
  li.textContent = `${input} ---> ${output}`;
  li.classList.add("list-group-item");
  historiesElement.appendChild(li);
  inputElement.value = "";
  outputElement.value = "";
};

/** ページ読み込み時に1回実行する */
window.addEventListener("load", () => {
  useVirtualMachine();
});

/** 入力欄が更新されたら実行する */
inputElement.addEventListener("input", () => {
  useVirtualMachine();
});

/** input内でEnterが押されたら保存 */
inputElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addHistory();
  }
});
