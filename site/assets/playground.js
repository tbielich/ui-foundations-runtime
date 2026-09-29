const stateApi = window.UIPlaygroundState || {};
const codeApi = window.UIPlaygroundCode || {};
const renderersApi = window.UIPlaygroundRenderers || {};

const {
  applyQueryParamsToControls,
  syncControlsToQueryParams,
  readPlaygroundState,
  applyControlVisibility,
  syncColorPickersFromControls,
  setControlValueFromColorPicker,
} = stateApi;

const { formatHtmlSnippet, renderHighlightedMarkup } = codeApi;
const renderers = renderersApi.renderers || {};

const hasRequiredApis =
  typeof applyQueryParamsToControls === "function" &&
  typeof syncControlsToQueryParams === "function" &&
  typeof readPlaygroundState === "function" &&
  typeof applyControlVisibility === "function" &&
  typeof syncColorPickersFromControls === "function" &&
  typeof setControlValueFromColorPicker === "function" &&
  typeof formatHtmlSnippet === "function" &&
  typeof renderHighlightedMarkup === "function";

if (!hasRequiredApis) {
  console.warn(
    "[ui-foundations] Playground modules failed to initialize; skipping playground bootstrap.",
  );
} else {
  const initVanillaPlayground = (container) => {
    const rendererId = container.dataset.renderer;
    const renderer = renderers[rendererId];
    if (!renderer) return;

    const playgroundId = container.dataset.playgroundId;
    const queryPrefix = container.dataset.queryPrefix || playgroundId;
    const form = container.querySelector(`#${playgroundId}-controls`);
    const mountNode = container.querySelector(`#${playgroundId}-root`);
    const codeNode = document.getElementById(`${playgroundId}-code`);
    const codeNjkNode = document.getElementById(`${playgroundId}-code-njk`);
    const codeWcNode = document.getElementById(`${playgroundId}-code-wc`);
    const resetButton = form
      ? form.querySelector("[data-playground-reset]")
      : null;
    if (!form || !mountNode || !codeNode) return;

    const codeGens = window.UIPlaygroundCodeGenerators || {};
    const njkGen = codeGens.njk && codeGens.njk[rendererId];
    const wcGen = codeGens.wc && codeGens.wc[rendererId];

    const controls = Array.from(form.querySelectorAll("[data-playground-control]"));
    const queryControls = controls.filter(
      (control) => control.dataset.queryParam === "1",
    );
    const controlByName = new Map(
      controls.map((control) => [control.name, control]),
    );
    applyQueryParamsToControls(queryPrefix, queryControls);
    applyControlVisibility(form, controls);
    syncColorPickersFromControls(form);

    const colorButtons = Array.from(
      form.querySelectorAll("[data-playground-color-button]"),
    );
    const colorPickers = Array.from(
      form.querySelectorAll("[data-playground-color-picker]"),
    );

    colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.targetControl;
        if (!targetId) return;

        const picker = form.querySelector(
          `[data-playground-color-picker][data-target-control="${targetId}"]`,
        );
        if (!picker) return;
        picker.click();
      });
    });

    const render = () => {
      applyControlVisibility(form, controls);
      const state = readPlaygroundState(controls);
      const result = renderer(state);
      mountNode.innerHTML = "";
      mountNode.append(result.element);

      const formattedCode = formatHtmlSnippet(result.code);
      renderHighlightedMarkup(codeNode, formattedCode);

      if (njkGen && codeNjkNode) {
        codeNjkNode.textContent = njkGen(state);
      }
      if (wcGen && codeWcNode) {
        codeWcNode.textContent = wcGen(state);
      }

      syncColorPickersFromControls(form);
      syncControlsToQueryParams(queryPrefix, queryControls);
    };

    colorPickers.forEach((picker) => {
      picker.addEventListener("input", () => {
        setControlValueFromColorPicker(form, picker);
        render();
      });
      picker.addEventListener("change", () => {
        setControlValueFromColorPicker(form, picker);
        render();
      });
    });

    form.addEventListener("input", (event) => {
      if (event.target?.matches?.("[data-playground-color-picker]")) return;
      render();
    });
    form.addEventListener("change", (event) => {
      if (event.target?.matches?.("[data-playground-color-picker]")) return;
      render();
    });
    mountNode.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (rendererId !== "checkbox") return;
      if (target.type !== "checkbox") return;

      const checkedControl = controlByName.get("checked");
      if (checkedControl instanceof HTMLInputElement) {
        checkedControl.checked = target.checked;
      }

      const stateControl = controlByName.get("state");
      if (
        stateControl instanceof HTMLSelectElement &&
        stateControl.value === "indeterminate" &&
        target.indeterminate === false
      ) {
        stateControl.value = "default";
      }

      render();
    });

    // Date Picker: the calendar preview is re-rendered from the controls on
    // every render(), so selection must write back to the day/month/year
    // controls (the source of truth) rather than to the throwaway preview DOM.
    if (rendererId === "datePicker") {
      const setControl = (name, value) => {
        const control = controlByName.get(name);
        if (control) control.value = value;
      };
      const readMonthControl = () => {
        const control = controlByName.get("month");
        const parsed = control ? parseInt(control.value, 10) : NaN;
        return Number.isFinite(parsed) ? parsed : new Date().getMonth() + 1;
      };
      const readYearControl = () => {
        const control = controlByName.get("year");
        const parsed = control ? parseInt(control.value, 10) : NaN;
        return Number.isFinite(parsed) && parsed >= 1900 && parsed <= 2100
          ? parsed
          : new Date().getFullYear();
      };
      const setState = (value) => {
        const stateControl = controlByName.get("state");
        if (stateControl instanceof HTMLSelectElement) {
          stateControl.value = value;
        }
      };
      const shiftMonth = (delta) => {
        let month = readMonthControl() - 1 + delta; // 0-based
        let year = readYearControl();
        month += year * 12;
        year = Math.floor(month / 12);
        month = ((month % 12) + 12) % 12;
        setControl("month", String(month + 1));
        setControl("year", String(year));
      };

      mountNode.addEventListener("click", (event) => {
        const cell = event.target.closest("button.uif-calendar-cell");
        if (cell && !cell.disabled) {
          event.preventDefault();
          const day = parseInt(cell.textContent.trim(), 10);
          if (day) {
            // Pin day AND the currently visible month/year so the selection is
            // unambiguous and gets highlighted on the next render.
            setControl("day", String(day));
            setControl("month", String(readMonthControl()));
            setControl("year", String(readYearControl()));
            setState("default");
            render();
          }
          return;
        }

        const trigger = event.target.closest("[aria-label='Open calendar']");
        if (trigger && !trigger.disabled) {
          event.preventDefault();
          const stateControl = controlByName.get("state");
          const isOpen =
            stateControl instanceof HTMLSelectElement &&
            stateControl.value === "open";
          setState(isOpen ? "default" : "open");
          render();
          return;
        }

        const prev = event.target.closest("[aria-label='Previous month']");
        if (prev && !prev.disabled) {
          event.preventDefault();
          shiftMonth(-1);
          setState("open");
          render();
          return;
        }
        const next = event.target.closest("[aria-label='Next month']");
        if (next && !next.disabled) {
          event.preventDefault();
          shiftMonth(1);
          setState("open");
          render();
          return;
        }
      });

      mountNode.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) return;
        const name = select.getAttribute("name");
        if (name === "month") {
          setControl("month", String(parseInt(select.value, 10) + 1));
          setState("open");
          render();
        } else if (name === "year") {
          setControl("year", select.value);
          setState("open");
          render();
        }
      });
    }
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        form.reset();
        syncColorPickersFromControls(form);
        render();
      });
    }

    render();
  };

  const containers = Array.from(document.querySelectorAll("[data-playground]"));
  containers.forEach((container) => {
    const runtime = container.dataset.runtime || "vanilla";
    if (runtime === "vanilla") {
      initVanillaPlayground(container);
    }
  });
}
