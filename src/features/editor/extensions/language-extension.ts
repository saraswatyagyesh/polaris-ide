import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";

export const getLanguageExtension = (filename: string): Extension => {

    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "js":
            return javascript();
        case "cpp":
            return cpp();
        case "jsx":
            return javascript({ jsx: true });
        case "tsx":
            return javascript({ typescript: true, jsx: true });
        case "css":
            return css();
        case "html":
            return html();
        case "md":
            return markdown();
        case "py":
            return python();
        default:
            return [];
    };
};