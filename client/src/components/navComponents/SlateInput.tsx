import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Editor,
  BaseEditor,
  createEditor,
  Descendant,
  Transforms,
  Text,
  Range,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useFocused,
  useSlate,
} from "slate-react";

import { withHistory, HistoryEditor } from "slate-history";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string; bold?: true };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

function SlateInput(props: any) {
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  function sendMessage() {
    let x = JSON.parse(JSON.stringify(editor));

    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
    props.onMessageSubmit(x.children);
  }

  const handleKeyPress = (event: any) => {
    if (!event.shiftKey && event.which === 13) {
      event.preventDefault();
      sendMessage();
    }
  };

  // useMemo(() => {
  //   Transforms.select(editor, { offset: 0, path: [0, 0] });
  // }, []);

  useEffect(() => {
    console.log("focus");
    Transforms.select(editor, { offset: 0, path: [0, 0] });
  }, [editor]);

  return (
    <div id="outerTxtInput">
      <Slate editor={editor} value={initialValue}>
        <Editable
          autoFocus
          onKeyPress={(event) => handleKeyPress(event)}
          id="txtInput"
        />
      </Slate>
    </div>
  );
}

export default SlateInput;
