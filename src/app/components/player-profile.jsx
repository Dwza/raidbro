let React = require('react');
let mui = require('material-ui');
let RaisedButton = mui.RaisedButton;

//http://us.battle.net/static-render/us/emerald-dream/25/133563673-avatar.jpg

let PlayerProfile = React.createClass({

  render: function () {
    let customActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this._handleCustomDialogCancel} />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this._handleCustomDialogSubmit} />
    ];

    <Dialog
      title="Dialog With Custom Actions"
      actions={customActions}
      modal={this.state.modal}>
      The actions in this window were passed in as an array of react objects.
    </Dialog>

    <Dialog
      title="Dialog With Scrollable Content"
      actions={customActions}
      autoDetectWindowHeight={true}
      autoScrollBodyContent={true} >
        <div style={{height: '2000px'}}>
          Really long content
        </div>
    </Dialog>

  }

});

module.exports = PlayerProfile;
