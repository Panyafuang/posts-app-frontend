import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment";
import { Post } from "./post.model";

const BACKEND_URL: string = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`
    this.http.get<{ message: string, posts: any, totalPosts: number }>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            }
          }),
          totalPosts: postData.totalPosts
        }
      }))
      .subscribe(transformedPostsData => {
        this.posts = transformedPostsData.posts; // updated local posts
        this.postsUpdated.next({
          posts: [...this.posts],
          totalPosts: transformedPostsData.totalPosts
        });
      });
  }

  getPost(id: string) {
    // return {...this.posts.find(post => post.id === id)}; // clone obj. that return from function find
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    /** JSON can't include a file, instead of sending JSON, we'll now send form data
     * FormData allows us to combine text and blob
    */
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title); // title will be the file name i provide to the backend. ใช้ title เป็นชื่อรูป
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe(responseData => {
        // const post: Post = {
        //   id: responseData.post.id,
        //   title: title,
        //   content: content,
        //   imagePath: responseData.post.imagePath
        // }
        // this.posts.push(post); // add new post to local post
        // this.postsUpdated.next([...this.posts]); // emit new post for entrie app

        this.router.navigate(['/']);
      });
  }

  /**
   *
   * @param image = If create new post image or change image in edit mode is File type, But if not change image is string type.
   */
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    // Change image, send data of formData
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      // Not change iamge, send data of JSON type
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }

    this.http.put<{ message: string, post: Post }>(BACKEND_URL + id, postData)
      .subscribe(response => {
        // const updatedPosts = [...this.posts];
        // const postIndex = updatedPosts.findIndex(post => post.id === id);
        // const post: Post = {
        //   id: id,
        //   title: title,
        //   content: content,
        //   imagePath: response.post.imagePath
        // }
        // updatedPosts[postIndex] = post;
        // this.posts = updatedPosts;
        // this.postsUpdated.next([...this.posts]);

        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);

      // .subscribe(() => {
      //   const updatedPosts = this.posts.filter((post: Post) => post.id !== postId);
      //   this.posts = updatedPosts;
      //   this.postsUpdated.next([...this.posts]); // [...this.posts] = copy this.posts array เพื่อป้องกันไม่ให้ component อื่นแก้ไขได้
      // });
  }
}
