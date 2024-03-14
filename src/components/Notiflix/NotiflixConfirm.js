import Notiflix from "notiflix";

const NotiflixConfirm = (confirmTitle, confirmMessage, yesCallback, noCallback, confirmWidth) => {
    return (
        Notiflix.Confirm.show(
            confirmTitle,
            confirmMessage,
            '예',
            '아니요',
            async () => {
                if(typeof yesCallback === 'function') {
                    await yesCallback();
                }
            },() => {
                if(typeof noCallback === 'function') {
                    noCallback();
                }
            },{
                position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: confirmWidth ? confirmWidth : '280px'
            }
        )
    );
};

export default NotiflixConfirm;