import "/vendor/ui-foundations/elements/index.js";
import { Calendar } from "/vendor/ui-foundations/components/calendar.js";
import { DateInput } from "/vendor/ui-foundations/components/date-input.js";
import { enhanceInputFields, observeInputFields } from "/vendor/ui-foundations/components/input-field.js";
import { enhanceTable } from "/vendor/ui-foundations/components/table.js";

for (const element of document.querySelectorAll("#base-calendar .uif-calendar:not([data-enhanced])")) {
  element.setAttribute("data-enhanced", "");
  new Calendar(element);
}
const date = document.getElementById("base-date");
date.setAttribute("data-enhanced", "");
new DateInput(date);
enhanceInputFields();
observeInputFields();
enhanceTable(document.getElementById("base-table"));
document.getElementById("open-dialog").addEventListener("click", () => {
  document.getElementById("base-dialog").setAttribute("open", "");
});
document.getElementById("base-dialog").addEventListener("uif-dialog-confirm", event => {
  event.currentTarget.removeAttribute("open");
});
