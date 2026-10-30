import { EditorView, basicSetup } from "codemirror";
import { keymap, type KeyBinding } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import prettier from "prettier/standalone";
import htmlParser from "prettier/plugins/html";

export interface HtmlCodeMirrorOptions {
  theme?: "dark" | "light";
  height?: string;
}
export interface CreateHtmlCodeMirrorOptions {
  parent: HTMLElement;
  value?: string;
  theme?: "dark" | "light";
  height?: string;
  onChange?: (value: string) => void;
}

declare global {
  interface Window {
    current_mirror_editor?: EditorView;
  }
}

const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const setStatus = (view: EditorView, message = "", title = ""): void => {
  const status = view.dom
    .closest(".codemirror-wrapper")
    ?.querySelector(".codemirror-status") as HTMLElement | null;

  if (!status) {
    return;
  }

  status.textContent = message;
  status.title = title;
};

export const toggleFullScreen = (view: EditorView): void => {
  const wrapper = view.dom.closest(".codemirror-wrapper") as HTMLElement | null;

  if (!wrapper) {
    return;
  }

  wrapper.classList.toggle("fullscreen");

  const btn = wrapper.querySelector(
    ".codemirror-fullscreen-btn",
  ) as HTMLButtonElement | null;

  if (btn) {
    btn.classList.toggle("active");
    btn.innerHTML = wrapper.classList.contains("fullscreen") ? "✕" : "⛶";
  }

  window.setTimeout(() => view.requestMeasure(), 50);
};

const fullScreenKeymap = keymap.of([
  {
    key: "F11",
    run: (view: EditorView) => {
      toggleFullScreen(view);
      return true;
    },
  },
  {
    key: "Escape",
    run: (view: EditorView) => {
      const wrapper = view.dom.closest(".codemirror-wrapper");

      if (wrapper?.classList.contains("fullscreen")) {
        toggleFullScreen(view);
        return true;
      }

      return false;
    },
  },
] satisfies KeyBinding[]);

export const validateHTML = (code: string): string[] => {
  const errors: string[] = [];
  const stack: Array<{ tag: string; index: number }> = [];

  const cleanedCode = code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<\?[\s\S]*?\?>/g, "");

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)(?:\s[^<>]*)?>/g;

  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleanedCode)) !== null) {
    const fullTag = match[0];
    const tagNameCheck = match[1];
    if (!tagNameCheck) {
      continue;
    }
    const tagName = tagNameCheck.toLowerCase();

    const isClosingTag = fullTag.startsWith("</");
    const isSelfClosing = fullTag.endsWith("/>") || VOID_HTML_TAGS.has(tagName);

    if (isSelfClosing) {
      continue;
    }

    if (!isClosingTag) {
      stack.push({
        tag: tagName,
        index: match.index,
      });
      continue;
    }

    const last = stack.pop();

    if (!last) {
      errors.push(
        `Balise fermante inattendue </${tagName}> à la position ${match.index}.`,
      );
      continue;
    }

    if (last.tag !== tagName) {
      errors.push(`Balise </${tagName}> inattendue. Attendu : </${last.tag}>.`);
    }
  }

  for (const item of stack.reverse()) {
    errors.push(`Balise <${item.tag}> non fermée à la position ${item.index}.`);
  }

  return errors;
};

export const formatHTML = async (code: string): Promise<string> => {
  return await prettier.format(code, {
    parser: "html",
    plugins: [htmlParser],
    printWidth: 200,
    tabWidth: 2,
    useTabs: false,
    bracketSameLine: false,
    htmlWhitespaceSensitivity: "ignore",
  });
};

export const formatEditorHTML = async (view: EditorView): Promise<boolean> => {
  const wrapper = view.dom.closest(".codemirror-wrapper") as HTMLElement | null;
  const formatBtn = wrapper?.querySelector(
    ".codemirror-format-btn",
  ) as HTMLButtonElement | null;
  const originalHTML = formatBtn?.innerHTML ?? "";

  if (formatBtn) {
    formatBtn.innerHTML = "⏳";
    formatBtn.disabled = true;
  }

  try {
    const code = view.state.doc.toString();
    const errors = validateHTML(code);

    if (errors.length > 0) {
      const firstError = errors[0];
      const otherCount = errors.length - 1;

      let message = `⚠️ ${firstError}`;

      if (otherCount > 0) {
        message += ` (et ${otherCount} autre${otherCount > 1 ? "s" : ""})`;
      }

      setStatus(view, message, errors.join("\n"));
      return false;
    }

    const formatted = await formatHTML(code);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formatted,
      },
    });

    setStatus(view, "HTML formaté", "");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(view, `Erreur : ${message}`, message);
    console.error("Erreur de formatage HTML :", error);
    return false;
  } finally {
    if (formatBtn) {
      formatBtn.innerHTML = originalHTML;
      formatBtn.disabled = false;
    }
  }
};

export const createHtmlCodeMirror = (
  options: CreateHtmlCodeMirrorOptions,
): EditorView => {
  const wrapper = document.createElement("div");
  wrapper.className = "codemirror-wrapper";

  if (options.height) {
    wrapper.style.setProperty("--codemirror-height", options.height);
  }

  options.parent.innerHTML = "";
  options.parent.appendChild(wrapper);

  const toolbar = document.createElement("div");
  toolbar.className = "codemirror-toolbar";

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.type = "button";
  fullscreenBtn.textContent = "⛶";
  fullscreenBtn.className = "codemirror-fullscreen-btn btn";
  fullscreenBtn.title = "Plein écran (F11)";
  toolbar.appendChild(fullscreenBtn);

  const formatBtn = document.createElement("button");
  formatBtn.type = "button";
  formatBtn.innerHTML = "🧹";
  formatBtn.className = "codemirror-btn codemirror-format-btn btn";
  formatBtn.title = "Formater le HTML";
  toolbar.appendChild(formatBtn);

  const statusSpan = document.createElement("div");
  statusSpan.className = "codemirror-status";
  toolbar.appendChild(statusSpan);

  wrapper.appendChild(toolbar);

  const extensions = [
    basicSetup,
    fullScreenKeymap,
    html(),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        options.onChange?.(update.state.doc.toString());
      }
    }),
  ];

  if (options.theme !== "light") {
    extensions.push(oneDark);
  }

  const view = new EditorView({
    doc: options.value ?? "",
    extensions,
    parent: wrapper,
  });

  fullscreenBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFullScreen(view);
  });

  formatBtn.addEventListener("click", async () => {
    const formatted = await formatEditorHTML(view);
    if (formatted) {
      options.onChange?.(view.state.doc.toString());
    }
  });

  window.current_mirror_editor = view;

  return view;
};

export const getEditorValue = (view: EditorView): string => {
  return view.state.doc.toString();
};

export const setEditorValue = (view: EditorView, value: string): void => {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: value,
    },
  });
};
