"use client"

import { useState, useMemo, useEffect } from "react" // Added useMemo, useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Reply } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckIcon, DotsHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons"
import { AnnotatedImage } from "@/components/annotated-image"
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"; // Ensure this path is correct for your project
import { Id } from "@/convex/_generated/dataModel";
import { createImageAnnotator } from "@annotorious/annotorious"; // Added import
import "@annotorious/annotorious/annotorious.css"; // Added import for styles

// Interface for the frontend comment structure
interface Comment {
  _id: Id<"comments">;
  author: {
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: number;
  resolved: boolean;
  replies: Comment[];
  documentId?: string;
  documentSrc?: string;
  parentId?: Id<"comments">;
  annotationData?: any; // Add annotationData here
}

// Type for individual comment objects coming from the Convex query
type ConvexCommentItem = {
  _id: Id<"comments">;
  _creationTime: number;
  content: string;
  timestamp: number;
  resolved: boolean;
  authorName: string;
  authorAvatar?: string;
  authorInitials: string;
  parentId?: Id<"comments">;
  documentId?: string;
  documentSrc?: string;
  annotationData?: any; // Add annotationData here
  replies: ConvexCommentItem[]; // Replies from query are also in this flat structure before transformation
};

// Transformation function
function transformConvexDataToFrontendComments(convexData: ConvexCommentItem[] | undefined): Comment[] {
  if (!convexData) return [];

  const mapComment = (commentItem: ConvexCommentItem): Comment => {
    return {
      _id: commentItem._id,
      author: {
        name: commentItem.authorName,
        avatar: commentItem.authorAvatar || "/placeholder.svg", // Default avatar
        initials: commentItem.authorInitials,
      },
      content: commentItem.content,
      timestamp: commentItem.timestamp,
      resolved: commentItem.resolved,
      parentId: commentItem.parentId,
      documentId: commentItem.documentId,
      documentSrc: commentItem.documentSrc,
      annotationData: commentItem.annotationData, // Add annotationData here
      replies: commentItem.replies ? commentItem.replies.map(mapComment) : [], // Recursively map replies
    };
  };
  return convexData.map(mapComment);
}


interface CommentThreadProps {
  comment: Comment;
  // documentId and documentSrc removed as they are not directly used by mutations within CommentThread
}

function CommentThread({ comment }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")

  const addReplyMutation = useMutation(api.comments.addReply);
  const toggleResolveCommentMutation = useMutation(api.comments.toggleResolveComment);
  const deleteCommentMutation = useMutation(api.comments.deleteComment);

  const handleReply = async () => {
    if (replyContent.trim()) {
      // IMPORTANT: Replace authorName, authorInitials, and optionally authorAvatar 
      // with actual authenticated user data.
      await addReplyMutation({
        parentId: comment._id,
        content: replyContent,
        authorName: "Current User (You)", // Placeholder
        authorInitials: "YU",          // Placeholder
        // authorAvatar: "/path/to/user/avatar.png", // Optional
      });
      setReplyContent("")
      setIsReplying(false)
    }
  }

  const handleResolve = async () => {
    await toggleResolveCommentMutation({ commentId: comment._id });
  };

  const handleDelete = async () => {
    await deleteCommentMutation({ commentId: comment._id });
  };

  return (
    <Card className={`w-full ${comment.resolved ? "opacity-70 bg-gray-50" : "bg-white"} shadow-sm border border-gray-200`}>
      <CardContent className="p-4 space-y-4">
        {/* Main Comment */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar} /> {/* Use transformed avatar */}
                <AvatarFallback className="text-sm font-medium">{comment.author.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{comment.author.name}</span>
                <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleResolve}>
                  {comment.resolved ? (
                    <>
                      <Cross2Icon className="h-4 w-4 mr-2" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Resolve
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm leading-relaxed text-gray-700 mt-3">{comment.content}</p>

          {comment.resolved && (
            <Badge variant="secondary" className="text-xs mt-2">
              <CheckIcon className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 ml-6 pl-4 border-l-2 border-gray-200 mt-4">
            {comment.replies.map((reply) => (
              // Each reply is a full Comment object due to recursive transformation
              <div key={reply._id.toString()} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={reply.author.avatar} />
                    <AvatarFallback className="text-xs">{reply.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{reply.author.name}</span>
                    <span className="text-xs text-gray-500">{new Date(reply.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 ml-9">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Input */}
        {isReplying ? (
          <div className="space-y-3 ml-6 pl-4 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] text-sm border-blue-200 focus:border-blue-400"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} className="bg-blue-600 hover:bg-blue-700">
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          !comment.resolved && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsReplying(true)} 
              className="h-8 text-sm mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}

export default function CommentsSystem({ src, name }: { src: string; name: string }) {
  // Fetch comments using useQuery. The data (commentsData) will be of type ConvexCommentItem[] | undefined.
  const commentsData = useQuery(api.comments.getComments, { documentSrc: src });
  const addCommentMutation = useMutation(api.comments.addComment);
  // toggleResolveCommentMutation and deleteCommentMutation are used within CommentThread

  const [newComment, setNewComment] = useState("")
  const [showNewComment, setShowNewComment] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<any | null>(null); // To store annotation data

  // Transform Convex data to the frontend Comment structure using useMemo
  const comments: Comment[] = useMemo(() => transformConvexDataToFrontendComments(commentsData as ConvexCommentItem[] | undefined), [commentsData]);

  useEffect(() => {
    const imageElement = document.getElementById('annotated-image-element'); // Ensure your AnnotatedImage component renders an img with this ID
    if (imageElement) {
      const anno = createImageAnnotator(imageElement as HTMLImageElement);
      anno.on('createAnnotation', (annotation: any) => {
        console.log('Annotation created:', annotation);
        setCurrentAnnotation(annotation); // Store the annotation data
        setShowNewComment(true); // Show the comment form
      });

      // Load existing annotations if they are stored with comments
      const annotationsToLoad = comments
        .filter(comment => comment.annotationData)
        .map(comment => comment.annotationData);
      if (annotationsToLoad.length > 0) {
        anno.setAnnotations(annotationsToLoad);
      }

      return () => {
        anno.destroy(); // Clean up Annotorious instance when component unmounts or src changes
      };
    }
  }, [src, comments]); // Re-initialize if src or comments (with annotations) change

  const handleAddComment = async () => {
    if (newComment.trim()) {
      let annotationDataForDb = currentAnnotation;
      if (currentAnnotation && currentAnnotation.target && currentAnnotation.target.created) {
        annotationDataForDb = {
          ...currentAnnotation,
          target: {
            ...currentAnnotation.target,
            created: new Date(currentAnnotation.target.created).getTime(), // Convert to timestamp
          },
        };
      }

      await addCommentMutation({
        content: newComment,
        authorName: "Current User (You)", 
        authorInitials: "YU",          
        documentSrc: src,
        documentId: name, 
        annotationData: annotationDataForDb, // Pass modified annotation data
      });
      setNewComment("")
      setShowNewComment(false)
      setCurrentAnnotation(null); // Reset current annotation
    }
  }

  const unresolvedComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  return (
    <div className="w-full h-screen p-6">
      <div className="flex gap-6 h-full">
        {/* Main Content Area - 85% */}
        <div className="w-[85%] pr-4">
          <div className="w-full h-full bg-gray-50 rounded-lg p-4">
            {/* Ensure AnnotatedImage renders an <img /> tag with id="annotated-image-element" */}
            <AnnotatedImage src={src} alt={name} id="annotated-image-element" />
          </div>
        </div>

        {/* Comments Sidebar - 15% */}
        <div className="w-[15%] min-w-80 border-l border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Comments
            </h2>
            <Button 
              size="sm" 
              onClick={() => setShowNewComment(true)} 
            >
              Add Comment
            </Button>
          </div>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 space-y-6">

              {/* New Comment Form */}
              {showNewComment && (
                <Card className="border-blue-200 shadow-sm flex-shrink-0">
                  <CardContent className="p-4 space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] border-blue-200 focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddComment}>
                        Comment
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewComment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Content */}
              <div className="space-y-6">
                {/* Active Comments */}
                {unresolvedComments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Active ({unresolvedComments.length})
                    </h3>
                    <div className="space-y-4">
                      {unresolvedComments.map((comment) => (
                        <CommentThread
                          key={comment._id.toString()}
                          comment={comment}
                          // documentSrc and documentId removed from props here
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Comments */}
                {resolvedComments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-600 border-b border-gray-200 pb-2">
                      Resolved ({resolvedComments.length})
                    </h3>
                    <div className="space-y-4">
                      {resolvedComments.map((comment) => (
                        <CommentThread
                          key={comment._id.toString()}
                          comment={comment}
                           // documentSrc and documentId removed from props here
                        />
                      ))}
                    </div>
                  </div>
                )}

                {comments.length === 0 && !showNewComment && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base">No comments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to add a comment!</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
