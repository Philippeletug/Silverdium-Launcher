const Swal = require('sweetalert2');

function Salert(title, htmlmsg, icotype, showConfirmButton = true, showCancelButton = false) {
    let logname = 'ALERT';
    console.log(`[${logname}]: Affichage d'une alert.`)
    Swal.fire({
        icon: icotype,
        html: `<h3>${title}</h3>${htmlmsg}`,
        confirmButtonText: '<i class="fa fa-thumbs-up">Ok</i>',
        cancelButtonText: '<i class="fa fa-thumbs-down">Annuler</i>',
        showClass: {
            popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
        },
        showConfirmButton: showConfirmButton,
        showCancelButton: showCancelButton,
        focusConfirm: false,
    });
}

export default Salert;
