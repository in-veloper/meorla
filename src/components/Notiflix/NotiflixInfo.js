import Notiflix from "notiflix";

const NotiflixInfo = (infoMessage, isAutoHide, infoWidth) => {
    const isShowOnlyTheLastOne = isAutoHide === false ? false : true;
    const isCloseButton = isAutoHide === false ? true : false;
    const isClickToClose = isAutoHide === false ? true : false;
    const delay = isAutoHide === false ? false : 3000;

    Notiflix.Notify.info(infoMessage, {
        position: 'center-center', showOnlyTheLastOne: isShowOnlyTheLastOne, closeButton: isCloseButton, clickToClose: isClickToClose, delay: delay, plainText: false, width: infoWidth ? infoWidth : '280px'
    });
};

export default NotiflixInfo;