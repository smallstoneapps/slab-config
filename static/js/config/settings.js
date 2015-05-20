
var ReplyDeleteButton = React.createClass({displayName: "ReplyDeleteButton",
  render: function() {
    return (
      React.createElement("a", {className: "btn btn-danger", onClick: this._onDestroyClick}, React.createElement("i", {className: "fa fa-remove"}))
    )
  },
  _onDestroyClick: function() {
    this.props.removeReply();
  }
});

var ReplyRow = React.createClass({displayName: "ReplyRow",
    render: function() {
        return (
            React.createElement("tr", null, 
                React.createElement("td", null, this.props.reply.text), 
                React.createElement("td", null, React.createElement(ReplyDeleteButton, {reply: this.props.reply, removeReply: this.remove}))
            )
        );
    },
    remove: function () {
      this.props.removeReply(this.props.reply);
    }
});

var ReplyAddButton = React.createClass({displayName: "ReplyAddButton",
  render: function () {
    return (
      React.createElement("a", {className: "btn btn-success", onClick: this._onClick}, React.createElement("i", {className: "fa fa-plus"}))
    )
  },
  _onClick: function () {
    this.props.submit();
  }
});

var NewReplyRow = React.createClass({displayName: "NewReplyRow",
  render: function () {
    return (
      React.createElement("tr", null, 
        React.createElement("td", null, React.createElement("input", {type: "text", className: "form-control", ref: "text"})), 
        React.createElement("td", null, React.createElement(ReplyAddButton, {submit: this.submit}))
      )
    );
  },
  submit: function () {
    var text = React.findDOMNode(this.refs.text).value.trim();
    this.props.addReply(text);
    React.findDOMNode(this.refs.text).value = '';
  }
});

var CustomRepliesTable = React.createClass({displayName: "CustomRepliesTable",
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
      rows.push(React.createElement(ReplyRow, {reply: reply, key: reply.text, removeReply: this.removeReply}));
    }.bind(this));
    return (
      React.createElement("table", {className: "table"}, 
        React.createElement("tbody", null, rows, React.createElement(NewReplyRow, {addReply: this.addReply}))
      )
    );
  }
});

React.render(React.createElement(CustomRepliesTable, null), document.getElementById('custom-replies'));

var Config = {
  replies: REPLIES,
  accessToken: ACCESS_TOKEN
};

function submit() {
  window.location = 'pebblejs://close#' + JSON.stringify(Config);
}
