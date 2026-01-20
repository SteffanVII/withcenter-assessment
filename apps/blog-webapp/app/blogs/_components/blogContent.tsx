
import HorizontalRule from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { renderToHTMLString } from "@tiptap/static-renderer"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Typography from "@tiptap/extension-typography"
import StarterKit from "@tiptap/starter-kit"
import { Highlight } from "@tiptap/extension-highlight"
import Superscript from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import "../../../components/tiptap-templates/simple/simple-editor.scss"
import { generateHTML } from "@tiptap/html"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

export const BlogContent = ( data : { content : string } ) => {

    const htmlContent = generateHTML(
        JSON.parse(data.content),
        [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                openOnClick: false,
                enableClickSelection: true,
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Typography,
            Superscript,
            Subscript,
            Selection,
        ]
    )

    return (
        <div className="simple-editor-wrapper" >
            <div className="simple-editor-content" >
                <div className="tiptap ProseMirror simple-editor px-[4rem] tiptap-content" dangerouslySetInnerHTML={{ __html : htmlContent }} ></div>
            </div>
        </div>
    )

}

export default BlogContent;