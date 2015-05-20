var ReplyDeleteButton = React.createClass({
  render: function() {
    return (
      <a className="btn btn-danger" onClick={this._onDestroyClick}><i className="fa fa-remove"></i></a>
    )
  },
  _onDestroyClick: function() {
    this.props.removeReply();
  }
});

var ReplyRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.reply.text}</td>
                <td>{<ReplyDeleteButton reply={this.props.reply} removeReply={this.remove} />}</td>
            </tr>
        );
    },
    remove: function () {
      this.props.removeReply(this.props.reply);
    }
});

var ReplyAddButton = React.createClass({
  render: function () {
    return (
      <a className="btn btn-success" onClick={this._onClick}><i className="fa fa-plus"></i></a>
    )
  },
  _onClick: function () {
    this.props.submit();
  }
});

var NewReplyRow = React.createClass({
  render: function () {
    return (
      <tr>
        <td><input type="text" className="form-control" ref="text" /></td>
        <td>{<ReplyAddButton submit={this.submit} />}</td>
      </tr>
    );
  },
  submit: function () {
    var text = React.findDOMNode(this.refs.text).value.trim();
    this.props.addReply(text);
    React.findDOMNode(this.refs.text).value = '';
  }
});

var CustomRepliesTable = React.createClass({
  removeReply: function(reply) {
    var index = this.state.replies.indexOf(reply);
    if (index >= 0) {
      this.state.replies.splice(index, 1);
    }
    this.setState({ replies: this.state.replies });
    Config.replies = this.state.replies;
  },
  addReply: function (text) {
    var replies = this.state.replies;
    replies.push({ text: text });
    this.setState({ replies: replies });
    Config.replies = this.state.replies;
  },
  getInitialState: function() {
    return {replies: window.REPLIES};
  },
  render: function() {
    var rows = [];
    var lastCategory = null;
    this.state.replies.forEach(function(reply) {
      rows.push(<ReplyRow reply={reply} key={reply.text} removeReply={this.removeReply} />);
    }.bind(this));
    return (
      <table className="table">
        <tbody>{rows}{<NewReplyRow addReply={this.addReply} />}</tbody>
      </table>
    );
  }
});

React.render(<CustomRepliesTable />, document.getElementById('custom-replies'));

var Config = {
  replies: REPLIES,
  accessToken: ACCESS_TOKEN
};

function submit() {
  window.location = 'pebblejs://close#' + JSON.stringify(Config);
}
