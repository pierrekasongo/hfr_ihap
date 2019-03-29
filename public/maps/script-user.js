

//CONFIGURATION PAGE
var makeEditable = (id) =>{

  $('#edit_'+id).hide();

  let editable="editable_"+id;

  let content=$('#'+editable).html();

  $('#'+editable).html('<input id="input_'+editable+'" type="password" value="' + content + '"/>');
  
  $('#save_'+id).show();

  $('#cancel_'+id).show();
}

var cancelEdition = (id) =>{

  $('#edit_'+id).show();

  let container="editable_"+id;

  let editable="input_editable_"+id;

  let content=$('#'+editable).val();

  $('#'+container).html("*******");
  
  $('#save_'+id).hide();

  $('#cancel_'+id).hide();
}

var saveEdition = (id) =>{

  let param=$("#editable_param_"+id).html();

  let password=$("#input_editable_"+id).val();

  $.ajax({

    url: '/updateUser',

    type: 'post',

    data:{

      id:id,

      password:password
    },

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      alert("Edition faite avec succès");

      cancelEdition(id);
    }
  });
}

