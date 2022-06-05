import { JSDOM } from "jsdom";
import { marked } from "marked";
import createDOMPurify from "dompurify";
import VerifyError, { VError } from "./error";

const _root = new JSDOM();
const DOMPurify = createDOMPurify(_root.window as unknown as Window);

const inputRegex = /\[[\sx]\]/gim;
const linkRegex = /\[[A-Za-z_.-]*\]\([A-Za-z_.-\/:]*\)/gim;

export default function (source: string, rules: string[]): Boolean {
  let errors: VError[] = [];
  // parse source and generate browser context
  const clean = DOMPurify.sanitize(marked.parse(source));
  const {
    window: { document },
  } = new JSDOM(clean);

  // verify rules in document
  for (const rule of rules) {
    // parse rules and generate context for rules
    const _clean = DOMPurify.sanitize(marked.parse(rule));
    const {
      window: { document: ruleDoc },
    } = new JSDOM(_clean);

    // generate css selector for rules
    if (ruleDoc.body) {
      const selector = generateCSSSelector(ruleDoc.body);
      const elems = document.querySelectorAll(selector);

      if (elems.length) {
        const errs = Array.from(elems).map((elem) => matchRule(elem, rule));
        if (!errs.some((e) => typeof e === "boolean" && e === true)) {
          errs.flat().forEach((e) => errors.push(e as VError));
        }
      } else {
        // ! Element for rule not found
        errors.push({
          msg: "No match found",
          rule,
        });
      }
    }
  }

  if (errors.length) throw new VerifyError(errors);
  return true;
}

function matchRule(elem: Element, rule: string): Boolean | VError[] {
  const errors: VError[] = [];
  const links = rule.match(linkRegex) || [];
  const inputs = rule.match(inputRegex) || [];
  const hrefs = links
    .map((l) => (l.match(/\([A-Za-z.-\/_:]*\)/g) || [])[0])
    .filter((l) => l)
    .map((l) => l.substring(1, l.length - 1));
  const titles = links
    .map((l) => (l.match(/\[[A-Za-z.-\/_]*\]/g) || [])[0])
    .filter((l) => l)
    .map((l) => l.substring(1, l.length - 1));

  // match links title and href if any
  if (links.length) {
    // get the links and compare the text content
    elem.querySelectorAll("a").forEach((link) => {
      if (!hrefs.includes(link.getAttribute("href") || "")) {
        // [title](href) - expecting href to include blah blah
        errors.push({
          msg: `[title](href) - expected href to be in [${hrefs.join(",")}] 
Received: ${link.getAttribute("href") || ""}`,
          rule,
        });
      }

      if (!titles.some((t) => link.textContent?.includes(t))) {
        // [title](href) - expecting title to include blah blah
        errors.push({
          msg: `[title](href) - expected title to be in [${titles.join(",")}]
Received: ${link.textContent || ""}`,
          rule,
        });
      }
    });
  }

  // check for inputs if specified in rule
  if (inputs.length) {
    let inputs = elem.querySelectorAll("input");
    if (!inputs.length) {
      // expecting [] but got none
      errors.push({
        msg: "Expected to find [ ] or [x]\nReceived: none",
        rule,
      });
    }
  }

  // shallow match element text content
  let txt = rule
    .replaceAll("#", "")
    .replaceAll(inputRegex, "")
    .replaceAll(/^[-\s]*/g, "")
    .trim();

  links.forEach((l, i) => {
    txt = txt.replace(l, titles[i]);
  });

  if (!elem.textContent?.includes(txt)) {
    // expected text content to include - ${txt}
    errors.push({
      msg: `Expected text content to include: ${txt}
Received: ${elem.textContent}`,
      rule,
    });
  }

  if (errors.length) return errors;
  return true;
}

function generateCSSSelector(doc: HTMLElement): string {
  let selector = "";
  if (doc?.getAttribute("id")) {
    selector = `${doc.nodeName.toLowerCase() || ""}#${doc.getAttribute("id")}`;
    return selector;
  }

  if (doc?.getAttribute("class")) {
    selector = `${doc.nodeName.toLowerCase() || ""}.${doc.getAttribute(
      "class"
    )}`;
    selector = selector.replace(/\s/, ".");
  }

  if (doc.nodeName) {
    selector = doc.nodeName.toLowerCase();
  }

  if (doc?.children.length < 2) {
    if (!doc.children[0]) {
      return "";
    }

    selector += ">" + generateCSSSelector(doc.children[0] as HTMLElement);
    selector = selector.replace(/^[>]/, "");
    selector = selector.replace(/[>]$/, "");
    return selector;
  }
  return selector;
}
