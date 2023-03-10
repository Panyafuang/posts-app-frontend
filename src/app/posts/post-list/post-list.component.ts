import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading: boolean = false;
  totalPosts: number = 0;
  postsPerPage: number = 3;
  postSizeOptions: number[] = [1, 2, 5, 10];
  currentPage: number = 1;
  userIsAuthenticated: boolean = false;
  userId: string;
  private postsSub: Subscription = new Subscription;
  private authListenerSubs: Subscription = new Subscription;

  constructor(public _postsService: PostsService, private _authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this._postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this._authService.getUserId();
    this.postsSub = this._postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], totalPosts: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.totalPosts;
        this.posts = postData.posts;
      });
    /** Use at loading post after authenticated */
    this.userIsAuthenticated = this._authService.getIsAuth();
    /** Use at logout เพื่อเปลี่ยน UI */
    this.authListenerSubs = this._authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated: boolean) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this._authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1; // Plus 1 because pageIndex start with 0
    this.postsPerPage = pageData.pageSize;
    this._postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDeletePost(postId: string) {
    if (this.posts.length === 1 && (this.totalPosts - (this.postsPerPage * this.currentPage)) < this.totalPosts) {
      this.currentPage -= 1;
    }
    this._postsService.deletePost(postId).subscribe({
      next: () => {
        this.isLoading = true;
        this._postsService.getPosts(this.postsPerPage, this.currentPage);
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }
}
