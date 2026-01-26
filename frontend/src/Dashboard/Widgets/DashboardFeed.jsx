
// // src/Dashboard/Widgets/DashboardFeed.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import styled from 'styled-components';
// import { fetchFeed, createPost, createComment, deletePost, API_BASE_URL, fetchUserProfile } from '../../services/apiService';
// import defaultAvatar from '../../assets/images/default-avatar.png';
// import { FaPaperPlane, FaCommentAlt, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// // Styled Components - Combined from both old and new
// const FeedContainer = styled.div`
//     background-color: var(--background-secondary);
//     border: 1px solid var(--border-primary);
//     border-radius: 8px;
//     padding: 20px;
//     margin-bottom: 25px; /* Added for spacing on dashboard */
// `;

// const FeedHeader = styled.div`
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     margin-bottom: 15px;
//     h4 { margin: 0; }
// `;

// const MinimizeButton = styled.button`
//     background: none;
//     border: none;
//     color: var(--text-muted);
//     cursor: pointer;
//     padding: 5px;
//     &:hover { color: var(--text-accent); }
// `;

// const NewPostForm = styled.form`
//     display: flex;
//     gap: 15px;
//     margin-bottom: 20px;
//     border-bottom: 1px solid var(--border-secondary);
//     padding-bottom: 20px;
// `;

// const PostTextArea = styled.textarea`
//     flex-grow: 1;
//     min-height: 50px;
//     border-radius: 6px;
//     padding: 10px;
//     border: 1px solid var(--border-primary);
//     background-color: var(--background-tertiary);
//     color: var(--text-primary);
//     resize: vertical;
//     font-size: 1em;
//     &:focus {
//         outline: none;
//         border-color: var(--border-accent);
//     }
// `;

// const PostButton = styled.button`
//     background-color: var(--text-accent);
//     color: white;
//     border: none;
//     border-radius: 6px;
//     padding: 0 20px;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-weight: 600;
//     &:disabled {
//         background-color: var(--text-muted);
//         cursor: not-allowed;
//     }
// `;

// const PostList = styled.ul`
//     list-style: none;
//     padding: 0;
//     margin: 0;
// `;

// const PostItem = styled.li`
//     display: flex;
//     gap: 15px;
//     padding: 15px 0;
//     border-bottom: 1px solid var(--border-secondary);
//     &:last-child {
//         border-bottom: none;
//     }
// `;

// const AuthorAvatar = styled.img`
//     width: 45px;
//     height: 45px;
//     border-radius: 50%;
//     object-fit: cover;
//     flex-shrink: 0;
// `;

// const PostContent = styled.div`
//     flex-grow: 1;
// `;

// const PostHeader = styled.div`
//     display: flex;
//     align-items: baseline;
//     gap: 10px;
//     margin-bottom: 5px;
//     flex-wrap: wrap;
// `;

// const AuthorName = styled.span`
//     font-weight: 600;
//     color: var(--text-primary);
// `;

// const PostTimestamp = styled.span`
//     font-size: 0.8em;
//     color: var(--text-muted);
// `;

// const PostBody = styled.p`
//     margin: 0;
//     white-space: pre-wrap;
//     word-wrap: break-word;
//     color: var(--text-secondary);
// `;

// const PostActions = styled.div`
//     margin-top: 15px;
//     display: flex;
//     align-items: center;
// `;

// const CommentsToggleButton = styled.button`
//     background: none;
//     border: none;
//     color: var(--text-muted);
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     font-size: 0.9em;
//     padding: 5px;
//     border-radius: 4px;
//     &:hover {
//         color: var(--text-accent);
//         background-color: var(--background-tertiary);
//     }
// `;

// const DeleteButton = styled.button`
//     background: none;
//     border: none;
//     color: var(--text-muted);
//     cursor: pointer;
//     font-size: 0.9em;
//     margin-left: 10px;
//     padding: 5px;
//     border-radius: 4px;
//     &:hover {
//         color: var(--text-error);
//         background-color: var(--background-tertiary);
//     }
// `;

// const CommentSection = styled.div`
//     margin-top: 15px;
//     padding-left: 60px; /* Indent comments under the post */
// `;

// const CommentForm = styled.form`
//     display: flex;
//     gap: 10px;
//     margin-top: 10px;
// `;

// const CommentInput = styled.input`
//     flex-grow: 1;
//     border-radius: 15px;
//     border: 1px solid var(--border-primary);
//     background-color: var(--background-tertiary);
//     padding: 8px 15px;
//     font-size: 0.9em;
//     color: var(--text-primary);
//     &:focus { outline: none; border-color: var(--border-accent); }
// `;


// const DashboardFeed = ({ userRole }) => {
//     const [posts, setPosts] = useState([]);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [newPostContent, setNewPostContent] = useState(''); // Added from old
//     const [loading, setLoading] = useState(true); // Added from old
//     const [error, setError] = useState(''); // Added from old
//     const [submitting, setSubmitting] = useState(false); // Added from old
//     const [expandedComments, setExpandedComments] = useState(new Set()); // Added from old
//     const [newComment, setNewComment] = useState(''); // Added from old

//     const getFullImageUrl = useCallback((path) => {
//         if (!path) return defaultAvatar;
//         // Ensure API_BASE_URL doesn't end with / if path starts with /
//         const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
//         return `${baseUrl}${path}`;
//     }, []);

//     // Fetch both the feed and the current user's profile
//     const loadData = useCallback(async () => {
//         try {
//             setLoading(true);
//             const [feedData, userData] = await Promise.all([fetchFeed(), fetchUserProfile()]);
//             setPosts(feedData || []);
//             setCurrentUser(userData);
//             setError(''); // Clear error on successful load
//         } catch (err) {
//             setError(err.message || 'Could not load the feed.'); // Set error message
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => { loadData(); }, [loadData]);
    
//     const handleDeletePost = async (postId) => {
//         if (!window.confirm("Are you sure you want to delete this post?")) return;
//         try {
//             await deletePost(postId);
//             setPosts(posts.filter(p => p.id !== postId)); // Remove from UI
//             setError(''); // Clear any previous error
//         } catch (err) {
//             setError(err.message || 'Failed to delete post.');
//         }
//     };

//     const handlePostSubmit = async (e) => { // Added from old
//         e.preventDefault();
//         if (!newPostContent.trim()) return;
        
//         setSubmitting(true);
//         setError('');
//         try {
//             const newPost = await createPost(newPostContent);
//             setPosts(prevPosts => [newPost, ...prevPosts]);
//             setNewPostContent('');
//         } catch (err) {
//             setError(err.message || 'Failed to submit post.');
//         } finally {
//             setSubmitting(false);
//         }
//     };
    
//     const toggleComments = (postId) => { // Added from old
//         setExpandedComments(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(postId)) {
//                 newSet.delete(postId);
//             } else {
//                 newSet.add(postId);
//             }
//             return newSet;
//         });
//     };

//     const handleCommentSubmit = async (e, postId) => { // Added from old
//         e.preventDefault();
//         if (!newComment.trim()) return;
        
//         try {
//             const createdComment = await createComment(postId, newComment);
//             setPosts(prevPosts => prevPosts.map(p => {
//                 if (p.id === postId) {
//                     // Make sure comments array exists before spreading
//                     const existingComments = p.comments || [];
//                     return { ...p, comments: [...existingComments, createdComment] };
//                 }
//                 return p;
//             }));
//             setNewComment(''); // Clear comment input after submitting
//             setError(''); // Clear any previous error
//         } catch (err) {
//             setError(err.message || 'Failed to post comment.');
//         }
//     };

//     return (
//         <FeedContainer>
//             <FeedHeader>
//                 <h4>Company Feed</h4>
//                 <MinimizeButton onClick={() => setIsMinimized(!isMinimized)}>
//                     {isMinimized ? <FaChevronDown /> : <FaChevronUp />}
//                 </MinimizeButton>
//             </FeedHeader>

//             {!isMinimized && (
//                 <>
//                     {error && <p className="message-display error">{error}</p>}
//                     <NewPostForm onSubmit={handlePostSubmit}>
//                         <PostTextArea 
//                             placeholder="Share something with your team..."
//                             value={newPostContent}
//                             onChange={(e) => setNewPostContent(e.target.value)}
//                             disabled={submitting}
//                             rows={2}
//                         />
//                         <PostButton type="submit" disabled={submitting || !newPostContent.trim()}>
//                             <FaPaperPlane />
//                         </PostButton>
//                     </NewPostForm>

//                     {loading ? <p>Loading feed...</p> : (
//                         <PostList>
//                             {posts.map(post => {
//                                 const canDelete = currentUser && (currentUser.id === post.authorId || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'); // Added from old
//                                 return (
//                                 <PostItem key={post.id}>
//                                     <AuthorAvatar 
//                                         src={getFullImageUrl(post.authorAvatarPath)}
//                                         alt={post.authorName}
//                                         onError={(e) => { e.target.src = defaultAvatar; }}
//                                     />
//                                     <PostContent>
//                                         <PostHeader>
//                                             <AuthorName>{post.authorName}</AuthorName>
//                                             <PostTimestamp>{new Date(post.createdAt).toLocaleString()}</PostTimestamp>
//                                         </PostHeader>
//                                         <PostBody>{post.content}</PostBody>
                                        
//                                         <PostActions>
//                                             <CommentsToggleButton onClick={() => toggleComments(post.id)}>
//                                                 <FaCommentAlt />
//                                                 <span>{post.comments?.length || 0} Comments</span>
//                                             </CommentsToggleButton>
//                                             {canDelete && (
//                                                 <DeleteButton onClick={() => handleDeletePost(post.id)}>
//                                                     <FaTrash />
//                                                 </DeleteButton>
//                                             )}
//                                         </PostActions>

//                                         {expandedComments.has(post.id) && (
//                                             <CommentSection>
//                                                 {(post.comments || []).map(comment => (
//                                                     <PostItem key={comment.id}>
//                                                         <AuthorAvatar 
//                                                             src={getFullImageUrl(comment.authorAvatarPath)}
//                                                             alt={comment.authorName}
//                                                             onError={(e) => { e.target.src = defaultAvatar; }}
//                                                         />
//                                                         <PostContent>
//                                                             <PostHeader>
//                                                                 <AuthorName>{comment.authorName}</AuthorName>
//                                                                 <PostTimestamp>{new Date(comment.createdAt).toLocaleString()}</PostTimestamp>
//                                                             </PostHeader>
//                                                             <PostBody>{comment.content}</PostBody>
//                                                         </PostContent>
//                                                     </PostItem>
//                                                 ))}
//                                                 <CommentForm onSubmit={(e) => handleCommentSubmit(e, post.id)}>
//                                                     <CommentInput 
//                                                         type="text"
//                                                         placeholder="Write a comment..."
//                                                         value={newComment} // newComment state is global, needs to be managed for each post if multiple comment inputs are open
//                                                         onChange={(e) => setNewComment(e.target.value)}
//                                                     />
//                                                     <PostButton type="submit" disabled={!newComment.trim()}>
//                                                         <FaPaperPlane />
//                                                     </PostButton>
//                                                 </CommentForm>
//                                             </CommentSection>
//                                         )}
//                                     </PostContent>
//                                 </PostItem>
//                                 );
//                             })}
//                         </PostList>
//                     )}
//                 </>
//             )}
//         </FeedContainer>
//     );
// };

// export default DashboardFeed;
