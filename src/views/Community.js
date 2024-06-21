import React, { useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import { useUser } from "contexts/UserContext";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "../assets/css/community.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import { LiaCrownSolid } from "react-icons/lia";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import { useDropzone } from "react-dropzone";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Community() {
    const { user } = useUser();
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [selectedMenu, setSelectedMenu] = useState("opinionSharing");
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [opinionWriteModal, setOpinionWriteModal] = useState(false);
    const [opinionContentData, setOpinionContentData] = useState("");
    const [resourceContentData, setResourceContentData] = useState("");
    // const [contentData, setContentData] = useState("");
    const [titleValue, setTitleValue] = useState("");
    const [selectedOpinionCategoryOption, setSelectedOpinionCategoryOption] = useState("healthClass");
    const [opinionSharingData, setOpinionSharingData] = useState([]);
    const [resourceSharingData, setResourceSharingData] = useState([]);
    const [opinionDetailModal, setOpinionDetailModal] = useState(false);
    const [opinionSharingSelectedRow, setOpinionSharingSelectedRow] = useState(null);
    const [opinionDetailContentData, setOpinionDetailContentData]  = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [opinionTitleDetailValue, setOpinionTitleDetailValue] = useState("");
    const [opinionCategoryDetailValue, setOpinionCategoryDetailValue] = useState("");
    const [opinionContentDetailValue, setOpinionContentDetailValue] = useState("");
    const [isThumbedUp, setIsThumbedUp] = useState(false);
    const [opinionPinnedRows, setOpinionPinnedRows] = useState([]);
    const [resourcePinnedRows, setResourcePinnedRows] = useState([]);
    const [myOpinionSharingModal, setMyOpinionSharingModal] = useState(false);
    const [myOpinionSharingData, setMyOpinionSharingData] = useState(null);
    const [resourceWriteModal, setResourceWriteModal] = useState(false);
    const [selectedResourceCategoryOption, setSelectedResourceCategoryOption] = useState("classResource");
    const [fileMessage, setFileMessage] = useState(<div className='d-flex justify-content-center align-items-center text-muted'>이 곳을 클릭하거나 드래그하여 <br/>파일을 업로드 해주세요</div>);
    const [selectedFile, setSelectedFile] = useState(null);
    const [resourceSharingSelectedRow, setResourceSharingSelectedRow] = useState(null);
    const [resourceCategoryDetailValue, setResourceCategoryDetailValue] = useState("");
    const [resourceTitleDetailValue, setResourceTitleDetailValue] = useState("");
    const [resourceContentDetailValue, setResourceContentDetailValue] = useState("");
    const [resourceDetailContentData, setResourceDetailContentData] = useState("");
    const [resourceDetailModal, setResourceDetailModal] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [myResourceSharingModal, setMyResourceSharingModal] = useState(false);
    const [myResourceSharingData, setMyResourceSharingData] = useState(null);

    const opinionSharingGridRef = useRef(null);
    const resourceSharingGridRef = useRef(null);
    const opinionQuillRef = useRef(null);
    const resourceQuillRef = useRef(null);
    const myOpinionSharingGridRef = useRef(null);
    const myResourceSharingGridRef = useRef(null);

    const toggleOpinionWriteModal = () => setOpinionWriteModal(!opinionWriteModal);
    const toggleOpinionDetailModal = () => setOpinionDetailModal(!opinionDetailModal);
    const toggleMyOpinionSharingModal = () => setMyOpinionSharingModal(!myOpinionSharingModal);
    const toggleResourceWriteModal = () => setResourceWriteModal(!resourceWriteModal);
    const toggleResourceDetailModal = () => setResourceDetailModal(!resourceDetailModal);
    const toggleMyResourceSharingModal = () => setMyResourceSharingModal(!myResourceSharingModal);

    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    const opinionSharingCategoryFormatter = (params) => {
        if(params.data.osCategory === "healthClass") return "보건수업";
        else if(params.data.osCategory === "healthEdu") return "보건교육";
        else if(params.data.osCategory === "manageStudentHealth") return "학생건강관리";
        else if(params.data.osCategory === "manageBusiness") return "사업관리";
        else if(params.data.osCategory === "etc") return "기타";
    };

    const resourceSharingCategoryFormatter = (params) => {
        if(params.data.rsCategory === "classResource") return "수업자료";
        else if(params.data.rsCategory === "businessResource") return "사업자료";
        else if(params.data.rsCategory === "formResource") return "양식자료";
        else if(params.data.rsCategory === "etcResource") return "기타";
    };

    const registDateFormatter = (params) => {
        const dateTime = params.data.createdAt;

        let dateValue = dateTime.split("T")[0];
        let timeValue = dateTime.split("T")[1];
        const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";
        const returnTimeValue = (timeValue.split(":")[0] === "00" ? "00" : parseInt(timeValue.split(":")[0]).toString()) + "시 " + (timeValue.split(":")[1] === "00" ? "00" : parseInt(timeValue.split(":")[1]).toString()) + "분";

        return returnDateValue + returnTimeValue;
    };

    const [opinionSharingColDef] = useState([
        { field: "osCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: opinionSharingCategoryFormatter },
        { field: "osTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "recommendationCount", headerName: "추천수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    const [resourceSharingColDef] = useState([
        { field: "rsCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: resourceSharingCategoryFormatter },
        { field: "rsTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "recommendationCount", headerName: "추천수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    const [myOpinionSharingColDef] = useState([
        { field: "osCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: opinionSharingCategoryFormatter },
        { field: "osTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "recommendationCount", headerName: "추천수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    const [myResourceSharingColDef] = useState([
        { field: "rsCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: resourceSharingCategoryFormatter },
        { field: "rsTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "recommendationCount", headerName: "추천수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    const modules = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [
            { list: "ordered" },
            { list: "bullet" }
          ],
          ["link", "image"],
          [{ align: [] }, { color: [] }, { background: [] }], // dropdown with defaults from theme
        ],
    };
    
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "align",
        "color",
        "background",
    ]; 

    useEffect(() => {
        moveCommunityMenu({ target: { id: selectedMenu }});
    }, []);

    const gridRef = useRef();

    // 검색 시 카테고리 선택 Event
    const handleSearchCategory = (e) => {
        const selectedCategory = e.target.value;
        setSearchCategory(selectedCategory);
    };

    // 검색어 입력 Setting
    const handleSearchText = (e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    };

    // 메뉴별 각각 다른 Grid Setting
    const moveCommunityMenu = (e) => {
        const targetMenuId = e.target.id;
        setSelectedMenu(targetMenuId);
    };

    const writeInCommunity = () => {
        if(selectedMenu === "opinionSharing") {
            toggleOpinionWriteModal();
            resetOpinionWrite();  
        }else if(selectedMenu === "resourceSharing") {
            toggleResourceWriteModal();
            resetResourceWrite();
        }
    };

    const resetOpinionWrite = () => {
        setTitleValue("");
        setOpinionContentData("");
    };

    const saveOpinionWrite = async () => {
        const payload = { content: opinionContentData };

        const response = await axios.post(`${BASE_URL}/api/community/saveOpinionSharing`, {
            userId: user.userId,
            userName: user.name,
            schoolCode: user.schoolCode,
            osCategory: selectedOpinionCategoryOption,
            osTitle: titleValue,
            osContent: JSON.stringify(payload)
        });

        if(response.data === 'success') {
            const infoMessage = "의견공유 글이 정상적으로 등록되었습니다";
            NotiflixInfo(infoMessage);
            toggleOpinionWriteModal();
            fetchOpinionSharingData();
            resetOpinionWrite();
        }
    };

    const fetchOpinionSharingData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/community/getOpinionSharing`, {});

            if(response.data) {
                const responseData = response.data;
                setOpinionSharingData(responseData);

                const sortedData = responseData.sort((a, b) => b.recommendationCount - a.recommendationCount);
                setOpinionPinnedRows(sortedData.slice(0, 3));
            }
        }
    }, [user]);

    useEffect(() => {
        fetchOpinionSharingData();
    }, [fetchOpinionSharingData]);

    const handleOpinionQuillChange = (content, delta, source, editor) => {
        setOpinionContentData(editor.getContents());
    };

    const handleResourceQuillChange = (content, delta, source, editor) => {
        setResourceContentData(editor.getContents());
    };

    const handleOpinionDetailQuillChange = (content, delta, source, editor) => {
        setOpinionContentDetailValue(editor.getContents());
    };

    const handleResourceDetailQuillChange = (content, delta, source, editor) => {
        setResourceContentDetailValue(editor.getContents());
    };

    const handleSelectOpinionCategoryOption = (e) => {
        setSelectedOpinionCategoryOption(e.target.value);
    };

    const opinionSharingDoubleClick = async (params) => {
        const selectedRow = params.data;
        
        opinionCheckThumbsUp(selectedRow.id);
        setOpinionSharingSelectedRow(selectedRow);
        setOpinionCategoryDetailValue(selectedRow.osCategory);
        setOpinionTitleDetailValue(selectedRow.osTitle);
        setOpinionContentDetailValue(selectedRow.osContent);
        setIsEditMode(params.data.userId === user.userId);
        toggleOpinionDetailModal();

        const parsedContent = JSON.parse(selectedRow.osContent);
        setOpinionDetailContentData(parsedContent.content);

        if (opinionQuillRef.current && opinionQuillRef.current.getEditor) {
            opinionQuillRef.current.getEditor().setContents(parsedContent.content);
        }

        await opinionSharingIncrementViewCount(params.data.id);
    };

    const resourceSharingDoubleClick = async (params) => {
        const selectedRow = params.data;

        resourceCheckThumbsUp(selectedRow.id);
        setResourceSharingSelectedRow(selectedRow);
        setResourceCategoryDetailValue(selectedRow.rsCategory);
        setResourceTitleDetailValue(selectedRow.rsTitle);
        setResourceContentDetailValue(selectedRow.rsContent);
        setIsEditMode(params.data.userId === user.userId);
        toggleResourceDetailModal();

        const parsedContent = JSON.parse(selectedRow.rsContent);
        setResourceDetailContentData(parsedContent.content);

        if (resourceQuillRef.current && resourceQuillRef.current.getEditor) {
            resourceQuillRef.current.getEditor().setContents(parsedContent.content);
        }

        await resourceSharingIncrementViewCount(params.data.id);
    };

    const opinionSharingIncrementViewCount = async (rowId) => {
        const response = await axios.post(`${BASE_URL}/api/community/opinionSharingIncrementViewCount`, {
            rowId: rowId
        });

        if(response.data === "success") fetchOpinionSharingData();
    };

    const resourceSharingIncrementViewCount = async (rowId) => {
        const response = await axios.post(`${BASE_URL}/api/community/resourceSharingIncrementViewCount`, {
            rowId: rowId
        });

        if(response.data === "success") fetchResourceSharingData();
    };

    const updateOpinionSharing = async () => {
        const payload = { content: opinionContentDetailValue };

        const response = await axios.post(`${BASE_URL}/api/community/updateOpinionSharing`, {
            userId: user.userId,
            schoolCode: user.schoolCode,
            rowId: opinionSharingSelectedRow.id,
            osCategory: opinionCategoryDetailValue,
            osTitle: opinionTitleDetailValue,
            osContent: JSON.stringify(payload)
        });

        if(response.data === 'success') {
            const infoMessage = "의견공유 글이 정상적으로 수정되었습니다";
            NotiflixInfo(infoMessage);
            fetchOpinionSharingData();
            toggleOpinionDetailModal();
        }
    };

    const onThumbsUp = async (flag) => {
        if(isThumbedUp) {
            const response = await axios.post(`${BASE_URL}/api/community/thumbsDown`, {
                viewType: flag,
                userId: user.userId,
                postId: opinionSharingSelectedRow.id
            });

            if(response.data === 'success') {
                const infoMessage = "추천을 취소하였습니다";
                NotiflixInfo(infoMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
                fetchOpinionSharingData();
            }
        }else{
            const response = await axios.post(`${BASE_URL}/api/community/thumbsUp`, {
                viewType: flag,
                userId: user.userId,
                postId: opinionSharingSelectedRow.id
            });
    
            if(response.data === 'success') {
                const infoMessage = "현재 글을 추천하였습니다";
                NotiflixInfo(infoMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
                fetchOpinionSharingData();
            }else if(response.data === 'duplicate') {
                const warnMessage = "이미 현재 글을 추천하였습니다";
                NotiflixWarn(warnMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
                fetchOpinionSharingData();
            }
        }
    };

    const opinionCheckThumbsUp = async (rowId) => {
        const response = await axios.get(`${BASE_URL}/api/community/opinionCheckThumbsUp`, {
            params: {
                viewType: 'os',
                userId: user.userId,
                postId: rowId
            }
        });
        if(response.data) {
            if(response.data.hasThumbedUp === 0) setIsThumbedUp(false);
            else if(response.data.hasThumbedUp === 1) setIsThumbedUp(true);
        }
    };

    const resourceCheckThumbsUp = async (rowId) => {
        const response = await axios.get(`${BASE_URL}/api/community/resourceCheckThumbsUp`, {
            params: {
                viewType: 'rs',
                userId: user.userId,
                postId: rowId
            }
        });
        if(response.data) {
            if(response.data.hasThumbedUp === 0) setIsThumbedUp(false);
            else if(response.data.hasThumbedUp === 1) setIsThumbedUp(true);
        }
    };

    const getRowClass = (params) => {
        if(params.node.rowPinned) {
            return 'pinned-row';
        }
    };

    useEffect(() => {
        if(opinionSharingData && user) {
            const filteredData = opinionSharingData.filter(item => (
                item.userId === user.userId
            ));
            setMyOpinionSharingData(filteredData);
        }
    }, [opinionSharingData]);

    const handleMyOpinionSharingView = () => {
        toggleMyOpinionSharingModal();
    };

    const resetResourceWrite = () => {
        setTitleValue("");
        setResourceContentData("");
        setSelectedFile(null);
        setUploadedFileUrl(null);
        setUploadedFileName(null);
        setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br/>파일을 업로드 해주세요</div>);
    };

    const saveResourceWrite = async () => {
        const payload = { content: resourceContentData };

        let fileName = null;
        let fileUrl = null;

        if (selectedFile) {
            let formData = new FormData();
            const encodedFileName = encodeURIComponent(selectedFile.name).replace(/%20/g, "+");
            formData.append("uploadPath", `${user.userId}/resourceFiles`);
            formData.append("file", new File([selectedFile], encodedFileName, { type: selectedFile.type }));

            const config = { headers: { "Content-Type": "multipart/form-data" }};

            try{
                const fileUploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, config);

                if(fileUploadResponse.status === 200) {
                    const { filename, fileUrl: newFileUrl } = fileUploadResponse.data;
                    fileName = filename;
                    fileUrl = newFileUrl;
                }
            } catch (error) {
                console.log("자료공유 파일 업로드 중 ERROR", error);
                return; // 파일 업로드 실패 시 함수 종료
            }
        }

        try{
            const response = await axios.post(`${BASE_URL}/api/community/saveResourceSharing`, {
                userId: user.userId,
                userName: user.name,
                schoolCode: user.schoolCode,
                rsCategory: selectedResourceCategoryOption,
                rsTitle: titleValue,
                rsContent: JSON.stringify(payload),
                fileName: fileName,
                fileUrl: fileUrl,
                category: "resourceSharing"
            });

            if(response.data === 'success') {
                const infoMessage = "자료공유 글이 정상적으로 등록되었습니다";
                NotiflixInfo(infoMessage);
                toggleResourceWriteModal();
                fetchResourceSharingData();
                resetResourceWrite();
            }
        } catch (error) {
            console.log("자료공유 파일 업로드 중 ERROR", error);
        }

    };

    const fetchResourceSharingData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/community/getResourceSharing`, {});

            if(response.data) {
                const responseData = response.data;
                setResourceSharingData(responseData);

                const sortedData = responseData.sort((a, b) => b.recommendationCount - a.recommendationCount);
                setResourcePinnedRows(sortedData.slice(0, 3));
            }
        }
    }, [user]);

    useEffect(() => {
        fetchResourceSharingData();
    }, [fetchResourceSharingData]);

    const handleSelectResourceCategoryOption = (e) => {
        setSelectedResourceCategoryOption(e.target.value);
    };

    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setUploadedFileUrl(null);
            setUploadedFileName(acceptedFiles[0].name);
            setFileMessage(
                <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                    {acceptedFiles[0].name}
                    <Button close onClick={() => handleFileDelete()} />
                </div>
            );
        }
    }, []);
    
    const dropzoneConfig = {
        onDrop,
        onFileDialogCancel: () => setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br />파일을 업로드 해주세요</div>)
    };

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        multiple: false,
        noClick: uploadedFileUrl !== null, // 파일이 업로드된 상태에서는 클릭 비활성화
    });

    // 자료공유 모달 열릴 시 Dropzone 파일 메시지 설정
    useEffect(() => {
        if(resourceDetailModal && resourceSharingSelectedRow && resourceSharingSelectedRow.fileUrl) {
            setUploadedFileUrl(resourceSharingSelectedRow.fileUrl);
            setUploadedFileName(resourceSharingSelectedRow.fileName);
            setFileMessage(
                <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                    <a href={resourceSharingSelectedRow.fileUrl} download>{resourceSharingSelectedRow.fileName}</a>
                    <Button close onClick={() => handleFileDelete()} />
                </div>
            );
        } else if (resourceDetailModal && !resourceSharingSelectedRow) {
            setUploadedFileUrl(null);
            setUploadedFileName(null);
            setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br />파일을 업로드 해주세요</div>);
        }
    }, [resourceDetailModal, setResourceSharingSelectedRow]);

    const handleFileDelete = () => {
        setUploadedFileUrl(null);
        setUploadedFileName(null);
        setSelectedFile(null);
        setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br />파일을 업로드 해주세요</div>);
    };

    const deleteOpinionSharing = () => {
        if(opinionSharingSelectedRow) {
            const confirmTitle = "의견공유 글 삭제";
            const confirmMessage = "선택하신 의견공유 글을 삭제하시겠습니까?";
            
            const yesCallback = async () => {
                const response = await axios.post(`${BASE_URL}/api/community/deleteOpinionSharing`, {
                    rowId: opinionSharingSelectedRow.id,
                    userId: user.userId,
                    schoolCode: user.schoolCode
                });

                if(response.data === 'success') {
                    const infoMessage = "의견공유 글이 정상적으로 삭제되었습니다";
                    NotiflixInfo(infoMessage);
                    fetchOpinionSharingData();
                    toggleOpinionDetailModal();
                }
            };

            const noCallback = () => {
                return;
            };

            NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
        }
    };
    
    const updateResourceSharing = async () => {
        const payload = { content: resourceContentDetailValue };
        let fileUrl = uploadedFileUrl;
        let fileName = uploadedFileName;

        if(selectedFile) {
            let formData = new FormData();
            const encodedFileName = encodeURIComponent(selectedFile.name).replace(/%20/g, "+");
            formData.append("uploadPath", `${user.userId}/resourceFiles`);
            formData.append("file", new File([selectedFile], encodedFileName, { type: selectedFile.type }));

            const config = { header: { "Content-Type": "multipart/form-data" }};

            try {
                const fileUploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, config);

                if(fileUploadResponse.status === 200) {
                    const { filename, fileUrl: newFileUrl } = fileUploadResponse.data;
                    fileName = filename;
                    fileUrl = newFileUrl;
                }
            } catch (error) {
                console.log("자료공유 파일 업로드 중 ERROR", error);
                return;
            }
        }

        const response = await axios.post(`${BASE_URL}/api/community/updateResourceSharing`, {
            userId: user.userId,
            schoolCode: user.schoolCode,
            rowId: resourceSharingSelectedRow.id,
            rsCategory: resourceCategoryDetailValue,
            rsTitle: resourceTitleDetailValue,
            rsContent: JSON.stringify(payload),
            fileName: fileName,
            fileUrl: fileUrl
        });

        if(response.data === 'success') {
            const infoMessage = "자료공유 글이 정상적으로 수정되었습니다";
            NotiflixInfo(infoMessage);
            fetchResourceSharingData();
            toggleResourceDetailModal();
        }
    };

    const deleteResourceSharing = () => {
        if(resourceSharingSelectedRow) {
            const confirmTitle = "자료공유 글 삭제";
            const confirmMessage = "선택하신 자료공유 글을 삭제하시겠습니까?";

            const yesCallback = async () => {
                const response = await axios.post(`${BASE_URL}/api/community/deleteResourceSharing`, {
                    rowId: resourceSharingSelectedRow.id,
                    userId: user.userId,
                    schoolCode: user.schoolCode
                });
                
                if(response.data === 'success') {
                    const infoMessage = "자료공유 글이 정상적으로 삭제되었습니다";
                    NotiflixInfo(infoMessage);
                    fetchResourceSharingData();
                    toggleResourceDetailModal();
                }
            };

            const noCallback = () => {
                return;
            };

            NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
        }
    };

    useEffect(() => {
        if(resourceSharingData && user) {
            const filteredData = resourceSharingData.filter(item => (
                item.userId === user.userId
            ));
            setMyResourceSharingData(filteredData);
        }
    }, [resourceSharingData]);

    const handleMyResourceSharingView = () => {
        toggleMyResourceSharingModal();
    };

    return (
        <>
            <div className="content" style={{ height: '84.1vh', display: 'flex', flexDirection: 'column' }}>
                <Row className="align-items-center pb-2" style={{ flex: '1 1 auto' }}>
                    <Col md="7" className="align-items-left no-gutters">
                        <Nav className="community-nav" pills>
                            <NavItem>
                                <NavLink id="opinionSharing" onClick={moveCommunityMenu} active={selectedMenu === 'opinionSharing'}>의견공유</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="resourceSharing" onClick={moveCommunityMenu} active={selectedMenu === 'resourceSharing'}>자료공유</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="interact" onClick={moveCommunityMenu} active={selectedMenu === 'interact'}>시도교류</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="bambooForest" onClick={moveCommunityMenu} active={selectedMenu === 'bambooForest'}>대나무숲</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                    <Col md="5">
                        <Row className="justify-content-end align-items-center no-gutters">
                            <Input
                                className="ml-3 mr-2"
                                id="searchCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                value={searchCategory}
                                onChange={handleSearchCategory}
                            >
                                <option value='none'>전체</option>
                                <option value='none'>분류명</option>
                                <option value='mName'>제목</option>
                                <option value='mCompany'>작성자</option>
                                <option value='mEffect'>작성일</option>
                            </Input>
                            <Input
                                type="search"
                                value={searchText}
                                onChange={handleSearchText}
                                placeholder="검색 키워드를 입력하세요"
                                autoFocus={true}
                                style={{ width: '300px', height: '40px' }}
                            />
                            <Button className="ml-2" style={{ height: '38px' }}>검색</Button>
                        </Row>
                    </Col>
                </Row>
                <Row style={{ flex: '1 1 auto' }}>
                    <Col md="12">
                        <div className="ag-theme-alpine" style={{ height: '72vh' }}>
                            {selectedMenu === 'opinionSharing' && (
                                <AgGridReact
                                    ref={opinionSharingGridRef}
                                    rowData={opinionSharingData} 
                                    columnDefs={opinionSharingColDef} 
                                    defaultColDef={defaultColDef}
                                    onRowDoubleClicked={opinionSharingDoubleClick}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 의견공유 글이 없습니다</span>' } 
                                    pinnedTopRowData={opinionPinnedRows}
                                    getRowClass={getRowClass}
                                />
                            )}
                            {selectedMenu === 'resourceSharing' && (
                                <AgGridReact
                                    ref={resourceSharingGridRef}
                                    rowData={resourceSharingData} 
                                    columnDefs={resourceSharingColDef} 
                                    defaultColDef={defaultColDef}
                                    onRowDoubleClicked={resourceSharingDoubleClick}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 자료공유 글이 없습니다</span>' }
                                    pinnedTopRowData={resourcePinnedRows}
                                />
                            )}
                            {selectedMenu === 'interact' && (
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData} 
                                    columnDefs={columnDefs} 
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 시도교류 글이 없습니다</span>' }
                                />
                            )}
                            {selectedMenu === 'bambooForest' && (
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData} 
                                    columnDefs={columnDefs} 
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 대나무숲 글이 없습니다</span>' }
                                />
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters" style={{ flex: '1 1 auto' }}>
                    <Button onClick={writeInCommunity}>글쓰기</Button>
                    {selectedMenu === 'opinionSharing' && (
                        <Button className="ml-1" onClick={handleMyOpinionSharingView}>내가 쓴 의견공유 글</Button>
                    )}
                    {selectedMenu === 'resourceSharing' && (
                        <Button className="ml-1" onClick={handleMyResourceSharingView}>내가 쓴 자료공유 글</Button>
                    )}
                    {selectedMenu === 'interact' && (
                        <Button className="ml-1">내가 쓴 시도교류 글</Button>
                    )}
                    {selectedMenu === 'bambooForest' && (
                        <Button className="ml-1">내가 쓴 대나무숲 글</Button>
                    )}
                </Row>
            </div>

            <Modal isOpen={opinionWriteModal} toggle={toggleOpinionWriteModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleOpinionWriteModal}><b className="text-muted">의견공유 글쓰기</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input
                                id="opinionCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                value={selectedOpinionCategoryOption}
                                onChange={handleSelectOpinionCategoryOption}
                            >
                                <option value='healthClass'>보건수업</option>
                                <option value='healthEdu'>보건교육</option>
                                <option value='manageStudentHealth'>학생건강관리</option>
                                <option value='manageBusiness'>사업관리</option>
                                <option value='etc'>기타</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <div style={{ height: '24.6vh'}}>
                                <ReactQuill
                                    ref={opinionQuillRef}
                                    style={{ height: "18vh" }}
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={opinionContentData || ""}
                                    onChange={handleOpinionQuillChange}
                                />
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetOpinionWrite}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={saveOpinionWrite}>저장</Button>
                            <Button color="secondary" onClick={toggleOpinionWriteModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={opinionDetailModal} toggle={toggleOpinionDetailModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleOpinionDetailModal}><b className="text-muted">의견공유 상세</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="3" className="pr-4">
                            <Input
                                id="opinionCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                defaultValue={opinionSharingSelectedRow ? opinionSharingSelectedRow.osCategory : ""}
                                onChange={(e) => setOpinionCategoryDetailValue(e.target.value)}
                                disabled={!isEditMode}
                            >
                                <option value='healthClass'>보건수업</option>
                                <option value='healthEdu'>보건교육</option>
                                <option value='manageStudentHealth'>학생건강관리</option>
                                <option value='manageBusiness'>사업관리</option>
                                <option value='etc'>기타</option>
                            </Input>
                        </Col>
                        <Col className="d-flex justify-content-end no-gutters pr-4" md="8">
                            {!isEditMode && (
                                <Button className="mb-0 mt-0" onClick={() => onThumbsUp("os")}>
                                    <LiaCrownSolid className="mr-1" style={{ fontSize: 18, marginTop: '-2px', color: isThumbedUp ? 'gold' : '' }}/>추천
                                </Button>
                            )}
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                defaultValue={opinionSharingSelectedRow ? opinionSharingSelectedRow.osTitle : ""}
                                onChange={(e) => setOpinionTitleDetailValue(e.target.value)}
                                readOnly={!isEditMode}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                                {isEditMode ? (
                                    <div style={{ height: '24.6vh'}}>
                                        <ReactQuill
                                            ref={opinionQuillRef}
                                            style={{ height: "18vh" }}
                                            theme="snow"
                                            modules={modules}
                                            formats={formats}
                                            defaultValue={opinionDetailContentData || ""}
                                            onChange={handleOpinionDetailQuillChange}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: '26vh'}}>
                                        <ReactQuill
                                            ref={opinionQuillRef}
                                            style={{ height: "24.5vh" }}
                                            theme="snow"
                                            modules={{ toolbar: false }}
                                            readOnly={true}
                                            value={opinionDetailContentData || ""}
                                        />
                                    </div>
                                )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        {isEditMode ? (
                            <Col className="d-flex justify-content-end">
                                <Button onClick={updateOpinionSharing}>수정</Button>
                                <Button className="ml-1" onClick={deleteOpinionSharing}>삭제</Button>
                                <Button className="ml-1" onClick={toggleOpinionDetailModal}>취소</Button>
                            </Col>
                        ) : (
                            <Col className="d-flex justify-content-end">
                                <Button onClick={toggleOpinionDetailModal}>취소</Button>
                            </Col>
                        )}
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={myOpinionSharingModal} toggle={toggleMyOpinionSharingModal} centered style={{ minWidth: '58%' }}>
                <ModalHeader toggle={toggleMyOpinionSharingModal}><b className="text-muted">내 의견공유 글 내역</b></ModalHeader>
                <ModalBody>
                    <div className="ag-theme-alpine" style={{ height: '30vh'}}>
                        <AgGridReact 
                            ref={myOpinionSharingGridRef}
                            rowData={myOpinionSharingData}
                            columnDefs={myOpinionSharingColDef}
                            defaultColDef={defaultColDef}
                            onRowDoubleClicked={opinionSharingDoubleClick}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내 의견공유 글 내역이 없습니다</span>' } 
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleMyOpinionSharingModal}>닫기</Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={resourceWriteModal} toggle={toggleResourceWriteModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleResourceWriteModal}><b className="text-muted">자료공유 글쓰기</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input
                                id="resourceCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                value={selectedResourceCategoryOption}
                                onChange={handleSelectResourceCategoryOption}
                            >
                                <option value='classResource'>수업자료</option>
                                <option value='businessResource'>사업자료</option>
                                <option value='formResource'>양식</option>
                                <option value='etcResource'>기타</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <div style={{ height: '20.6vh' }}>
                                <ReactQuill
                                    ref={resourceQuillRef}
                                    style={{ height: "14vh" }}
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={resourceContentData || ""}
                                    onChange={handleResourceQuillChange}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-0 pr-4 pb-3" style={{ marginLeft: 2}}>
                        <Col md="1" className="text-center">
                            <Label>파일</Label>
                        </Col>
                        <Col md="11" style={{ border: '1px solid lightgrey', borderRadius: 3 }}>
                            {uploadedFileUrl ? (
                                <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                                    <a href={uploadedFileUrl} download>{uploadedFileName}</a>
                                    <Button close onClick={handleFileDelete} />
                                </div>
                            ) : (
                                <div {...getRootProps({ className: 'dropzone' })} style={{ width: '100%', height: '5vh', paddingTop: '7px', textAlign: 'center' }}>
                                    <input {...getInputProps()} />
                                    {fileMessage}
                                </div>
                            )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetResourceWrite}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={saveResourceWrite}>저장</Button>
                            <Button color="secondary" onClick={toggleResourceWriteModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>
            
            <Modal isOpen={resourceDetailModal} toggle={toggleResourceDetailModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleResourceDetailModal}><b className="text-muted">자료공유 상세</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input
                                id="resourceCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                defaultValue={resourceSharingSelectedRow ? resourceSharingSelectedRow.rsCategory : ""}
                                onChange={(e) => setResourceCategoryDetailValue(e.target.value)}
                                disabled={!isEditMode}
                            >
                                <option value='classResource'>수업자료</option>
                                <option value='businessResource'>사업자료</option>
                                <option value='formResource'>양식</option>
                                <option value='etcResource'>기타</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                defaultValue={resourceSharingSelectedRow ? resourceSharingSelectedRow.rsTitle : ""}
                                onChange={(e) => setResourceTitleDetailValue(e.target.value)}
                                readOnly={!isEditMode}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            {isEditMode ? (
                                <div style={{ height: '20.6vh' }}>
                                    <ReactQuill
                                        ref={resourceQuillRef}
                                        style={{ height: "14vh" }}
                                        theme="snow"
                                        modules={modules}
                                        formats={formats}
                                        defaultValue={resourceDetailContentData || ""}
                                        onChange={handleResourceDetailQuillChange}
                                    />
                                </div>
                            ) : (
                                <div style={{ height: '26vh'}}>
                                    <ReactQuill
                                        ref={resourceQuillRef}
                                        style={{ height: "24.5vh" }}
                                        theme="snow"
                                        modules={{ toolbar: false }}
                                        readOnly={true}
                                        value={resourceDetailContentData || ""}
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-0 pr-4 pb-3" style={{ marginLeft: 2 }}>
                        <Col md="1" className="text-center">
                            <Label>파일</Label>
                        </Col>
                        <Col className="p-2" md="11" style={{ border: '1px solid lightgrey', borderRadius: 3 }}>
                            {isEditMode ? (
                                <div {...getRootProps({className: 'dropzone'})} style={{ width: '100%', height: '5vh', paddingTop: '7px', textAlign: 'center' }}>
                                    <input {...getInputProps()}/>
                                    {fileMessage}
                                </div>
                            ) : (
                                resourceSharingSelectedRow && resourceSharingSelectedRow.fileUrl ? (
                                    <b><a href={resourceSharingSelectedRow.fileUrl} download>{resourceSharingSelectedRow.fileName}</a></b>
                                ) : (
                                    <div className="text-muted">파일 없음</div>
                                )
                            )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        {isEditMode ? (
                            <Col className="d-flex justify-content-end">
                                <Button onClick={updateResourceSharing}>수정</Button>
                                <Button className="ml-1" onClick={deleteResourceSharing}>삭제</Button>
                                <Button className="ml-1" onClick={toggleResourceDetailModal}>취소</Button>
                            </Col>
                        ) : (
                            <Col className="d-flex justify-content-end">
                                <Button onClick={toggleResourceDetailModal}>취소</Button>
                            </Col>
                        )}
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={myResourceSharingModal} toggle={toggleMyResourceSharingModal} centered style={{ minWidth: '58%' }}>
                <ModalHeader toggle={toggleMyResourceSharingModal}><b className="text-muted">내 자료공유 글 내역</b></ModalHeader>
                <ModalBody>
                    <div className="ag-theme-alpine" style={{ height: '30vh'}}>
                        <AgGridReact 
                            ref={myResourceSharingGridRef}
                            rowData={myResourceSharingData}
                            columnDefs={myResourceSharingColDef}
                            defaultColDef={defaultColDef}
                            onRowDoubleClicked={resourceSharingDoubleClick}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내 자료공유 글 내역이 없습니다</span>' } 
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleMyResourceSharingModal}>닫기</Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default Community;