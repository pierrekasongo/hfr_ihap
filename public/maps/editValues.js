
var makeEditable = (id) =>{

  $('#edit_'+id).hide();

  let editable="editable_"+id;

  let content=$('#'+editable).html();

  $('#'+editable).html('<input id="input_'+editable+'" type="text" value="' + content + '"/>');
  
  $('#save_'+id).show();

  $('#cancel_'+id).show();
}

var cancelEdition = (id) =>{

  $('#edit_'+id).show();

  let container="editable_"+id;

  let editable="input_editable_"+id;

  let content=$('#'+editable).val();

  $('#'+container).html(content);
  
  $('#save_'+id).hide();

  $('#cancel_'+id).hide();
}

var saveEdition = (id) =>{

  let param=$("#editable_param_"+id).html();

  let value=$("#input_editable_"+id).val();

  $.ajax({

    url: '/updateConfig',

    type: 'post',

    data:{
      param:param,
      value:value
    },

    beforeSend: function () {
      
    },
    success: function (obj) {
    },
    complete: function (data) {

      cancelEdition(id);
    }
  });
}



