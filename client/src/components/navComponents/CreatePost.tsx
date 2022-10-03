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

function CreatePost(props: any) {
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
    props.closeCreatePost();
  }

  function closeCreatePost() {
    props.closeCreatePost();
  }

  useEffect(() => {
    console.log("focus");
    Transforms.select(editor, { offset: 0, path: [0, 0] });
  }, [editor]);

  //https://github.com/microsoft/TypeScript/issues/11465
  const style = {
    backgroundColor: "rgba(0, 0, 0, 0.47)",
    position: "relative" as "relative",
    width: "75%",
    height: "200px",
    top: "125px",
    display: "flex",
    flexDirection: "column" as "column",
  };

  const slateDiv = {
    flexGrow: "1",
    margin: "5px",
  };
  const slateInnerDiv = {
    width: "100%",
    display: "flex",
  };

  const slateInnerDivWrap = {
    width: "100%",
    borderBottom: "solid",
  };

  const btnStyle = {
    width: "-webkit-fill-available",
    margin: "5px",
    marginTop: "0px",
    boxSizing: "border-box" as "border-box",
    cursor: "pointer",
  };

  const cancleBtnDiv = {
    borderBottom: "solid",
  };

  const cancleBtn = {
    border: "none",
    height: "30px",
    cursor: "pointer",
  };

  return (
    <div style={style}>
      <div style={slateDiv}>
        <div style={slateInnerDiv}>
          <div style={slateInnerDivWrap}>
            <div id="outerTxtInput">
              <Slate editor={editor} value={initialValue}>
                <Editable autoFocus id="txtInput" />
              </Slate>
            </div>
          </div>

          <div style={cancleBtnDiv}>
            <button style={cancleBtn} onClick={closeCreatePost}>
              x
            </button>
          </div>
        </div>
      </div>
      <div>
        <button style={btnStyle} onClick={sendMessage}>
          post
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
