import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './CustomEditor.css';

const CustomEditor = ({ onChange, initialValue }) => {
    const [editorReady, setEditorReady] = useState(false);
    const [editorData, setEditorData] = useState(initialValue || '');

    useEffect(() => {
        // Check if CKEditor is available
        if (typeof ClassicEditor !== 'undefined') {
            setEditorReady(true);
            console.log('CKEditor loaded successfully');
        } else {
            console.error('CKEditor failed to load');
            }
    }, []);

    // Update editor data when initialValue changes
    useEffect(() => {
        if (initialValue && initialValue !== editorData) {
            setEditorData(initialValue);
        }
    }, [initialValue]);

    // Enhanced toolbar configuration
    const editorConfiguration = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'fontSize',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'alignment',
                '|',
                'link',
                'blockQuote',
                'insertTable',
                '|',
                'undo',
                'redo'
            ],
            shouldNotGroupWhenFull: true
        },
        heading: {
            options: [
                { model: 'paragraph', title: 'Văn bản', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Tiêu đề 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Tiêu đề 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Tiêu đề 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'Tiêu đề 4', class: 'ck-heading_heading4' }
            ]
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
        },
        placeholder: 'Nhập nội dung tin tức ở đây...'
    };

    return (
        <div className="editor-container">
            {editorReady ? (
                <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    config={editorConfiguration}
                    onReady={(editor) => {
                        console.log('Editor is ready to use!', editor);
                        
                        // Add some initial content if empty
                        if (!editorData) {
                            editor.setData('<p>Hãy viết nội dung tin tức của bạn tại đây...</p>');
                        }
                        
                        // Set focus to the editor
                        setTimeout(() => {
                            try {
                                if (editor && typeof editor.focus === 'function') {
                                    editor.focus();
                                }
                            } catch (error) {
                                console.warn('Failed to focus editor:', error);
                            }
                        }, 300);
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        setEditorData(data);
                        onChange(data);
                    }}
                    onBlur={(event, editor) => {
                        console.log('Editor lost focus', editor);
                    }}
                    onFocus={(event, editor) => {
                        console.log('Editor gained focus', editor);
                    }}
                />
            ) : (
                <div className="editor-loading">Đang tải trình soạn thảo văn bản...</div>
            )}
        </div>
    );
};

export default CustomEditor;
