import React, { useState, useEffect, useRef } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import '@yaireo/tagify/dist/tagify.css';

function TagField({ suggestions = [], selectedRowValue, tagifyGridRef, category }) {
    const [whitelist, setWhitelist] = useState(suggestions);
    const symptomTagifyRef = useRef();
    const medicationTagifyRef = useRef();
    const actionMatterTagifyRef = useRef();
    const treatmentMatterTagifyRef = useRef();
    
    const baseTagifySettings = {
        blacklist: [],
        maxTags: 20,
        backspace: true,
        placeholder: category === "symptomTagField" ? "증상을 입력하세요" : 
                     category === "medicationTagField" ? "투약사항을 입력하세요" :
                     category === "actionMatterTagField" ? "조치 및 교육사항을 입력하세요" :
                     category === "treatmentMatterTagField" ? "처치사항을 입력하세요" : "",
        editTags: 1,
        dropdown: {
          enabled: 0,
          maxItems: 100
        },
        callbacks: {}
    };

    useEffect(() => {
        if(suggestions) {
            switch (category) {
                case "symptomTagField":
                    symptomTagifyRef.current.settings.whitelist = suggestions;
                    break;
                case "medicationTagField":
                    medicationTagifyRef.current.settings.whitelist = suggestions;
                    break;
                case "actionMatterTagField":
                    actionMatterTagifyRef.current.settings.whitelist = suggestions;
                    break;
                case "treatmentMatterTagField":
                    treatmentMatterTagifyRef.current.settings.whitelist = suggestions;
                    break;
                default:
                    break;
            }
        }
    }, [suggestions, category]);

    useEffect(() => {
        if (selectedRowValue) {
            clearTagsHandler();
        }
    }, [selectedRowValue]);

    const clearTagsHandler = () => {
        if (selectedRowValue.clearTargetField === 'all') {
            symptomTagifyRef.current.removeAllTags();
            medicationTagifyRef.current.removeAllTags();
            actionMatterTagifyRef.current.removeAllTags();
            treatmentMatterTagifyRef.current.removeAllTags();
        } else if (selectedRowValue.clearTargetField === category) {
            switch (category) {
                case "symptomTagField":
                    symptomTagifyRef.current.removeAllTags();
                    break;
                case "medicationTagField":
                    medicationTagifyRef.current.removeAllTags();
                    break;
                case "actionMatterTagField":
                    actionMatterTagifyRef.current.removeAllTags();
                    break;
                case "treatmentMatterTagField":
                    treatmentMatterTagifyRef.current.removeAllTags();
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        if (selectedRowValue && selectedRowValue.clearField === "N") {
            handleChange({ detail: { tagify: { value: [{ value: selectedRowValue }] } }, type: "add" }, category);
        }
    }, [selectedRowValue]);

    const handleChange = (e, category) => {
        let selectedRowValue = e.detail.tagify.value[0].value;
        if (selectedRowValue.type === "add" && selectedRowValue.text) {
            switch (category) {
                case "symptomTagField":
                    symptomTagifyRef.current.addTags(selectedRowValue.text);
                    break;
                case "medicationTagField":
                    medicationTagifyRef.current.addTags(selectedRowValue.text);
                    break;
                case "actionMatterTagField":
                    actionMatterTagifyRef.current.addTags(selectedRowValue.text);
                    break;
                case "treatmentMatterTagField":
                    treatmentMatterTagifyRef.current.addTags(selectedRowValue.text);
                    break;
                default:
                    break;
            }
            if (tagifyGridRef.current) {
                tagifyGridRef.current.api.deselectAll();
                tagifyGridRef.current.api.clearFocusedCell();
            }
        }
        if (whitelist.length === 0) {
            const newWhitelist = e.detail.tagify.value.map(item => item.value);
            setWhitelist(newWhitelist);
        }
    };

    const settings = {
        ...baseTagifySettings,
        whitelist: whitelist,
        callbacks: {}
    };

    const renderTagField = () => {
        switch (category) {
            case "symptomTagField":
                return <Tags tagifyRef={symptomTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />;
            case "medicationTagField":
                return <Tags tagifyRef={medicationTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />;
            case "actionMatterTagField":
                return <Tags tagifyRef={actionMatterTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />;
            case "treatmentMatterTagField":
                return <Tags tagifyRef={treatmentMatterTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />;
            default:
                return null;
        }
    };

    return (
        <div className="form-group" style={{ marginBottom: 0 }}>
            {renderTagField()}
        </div>
    );
}

export default TagField;
