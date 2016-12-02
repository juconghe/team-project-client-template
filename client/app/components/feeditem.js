import React from 'react';
import {deleteFeed,unlikeFeedItem,likeFeedItem,increaseViewCount} from '../server';
import Comment from './comment';
import Contents from './contents';
import CommentEntry from './commententry';
export default class FeedItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "id":props.data._id,
      "contents":props.data.contents,
      "likeCounter":props.data.likeCounter,
      "listOfComments":props.data.list_of_comments,
      "tag":props.data.tag,
      "view_count":props.data.view_count,
      "shouldHidden":true,
      "text":"Show Comment"
    }
    this.increaseFeedItemViewCount();
  }

  handleLikeClick(clickEvent) {
    clickEvent.preventDefault();
    if (clickEvent.button === 0) {
    var callbackFunction = (updatedLikeCounter) => {
    this.setState({likeCounter: updatedLikeCounter});
    };
    if (this.didUserLike()) {
    // User clicked 'unlike' button.
    unlikeFeedItem(this.state.id, 1, callbackFunction);
    } else {
      // User clicked 'like' button.
      likeFeedItem(this.state.id, 1, callbackFunction);
    }
  }
}

  didUserLike() {
  var likeCounter = this.state.likeCounter;
  var liked = false;
  // Look for a likeCounter entry with userId 4 -- which is the
  // current user.
  for (var i = 0; i < likeCounter.length; i++) {
    if (likeCounter[i]._id === 1) {
    liked = true;
    break;
    }
  }
    return liked;
  }

  handleDeleteFeed(clickEvent) {
    clickEvent.preventDefault();
    if(clickEvent.button === 0) {
      deleteFeed(1,this.state.id,this.props.type,()=>{
        this.props.refresh();
      });
    }
  }

  increaseFeedItemViewCount() {
    increaseViewCount(this.state.id,(newViewCount)=>{
      this.setState({view_count:newViewCount})
    })
  }

  handleHiddenClick(e){
    e.preventDefault();
    if(this.state.shouldHidden){
      this.setState({shouldHidden:!this.state.shouldHidden,text:"Hide Comment"})
    }else {
      this.setState({shouldHidden:!this.state.shouldHidden,text:"Show Comment"})
    }
    return this.state.shouldHidden;
  }

  shouldHidden(){
    if(this.state.shouldHidden){
      return "panel-footer hidden";
    }else {
      return "panel-footer";
    }
  }

commentRefresh(){
  this.props.refresh();
}
  render() {
    var likeButtonText = "Like";
      if (this.didUserLike()) {
        likeButtonText = "Unlike";
      }
    var data = this.state;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-12">
              <div className="media">
                <div className="media-left media-top">
                  <img className="media-object img-rounded" src="img/jucong_back.jpg" width="64" height="64" />
                </div>
                <div className="media-body">
                  Form Category: {data.tag.type_of_service}
                  <a href="#" onClick = {(e)=>this.handleDeleteFeed(e)}>
                    <span className="glyphicon glyphicon-remove pull-right"></span>
                  </a>
                  <br /><a href="#">{data.contents.request}</a>
                </div>
              </div>
            </div>
          </div>
          <Contents data={data}/>
          <hr />
          <div className="row">
            <div className="col-md-12">
              <ul className="list-inline icon-status">
                <li>
                  <span className="glyphicon glyphicon-eye-open"></span>
                  <a href="#">{data.view_count} Views</a>
                </li>
                <li>
                  <span className="glyphicon glyphicon-share-alt"></span>
                  <a href="#">Share</a>
                </li>
                <li>
                  <span className="glyphicon glyphicon-heart-empty"></span>
                  <a href="#">Save</a>
                </li>
                <li>
                  <span className="glyphicon glyphicon-thumbs-up"></span>
                  <a href="#" onClick= {(e) => this.handleLikeClick(e)}>
                  {data.likeCounter.length} {likeButtonText}</a>
                </li>
                <li>
                  <a href="#" onClick={(e) => this.handleHiddenClick(e)}>
                    {this.state.text}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={this.shouldHidden()}>
          <div className="row">
            <ul className="media-list">
              {
                data.listOfComments.map((commentId,i) => {
                  return (
                    <Comment key={i} data={commentId}/>
                  );
                })
              }
            </ul>
            <CommentEntry feedItemId={data.id} refresh={()=>this.commentRefresh()}/>
          </div>
        </div>
      </div>
    );
  }
}
