import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredTitle: string = '';
  enteredContent: string = '';
  post: Post;
  isLoading: boolean = false;
  form: FormGroup;
  imagePreview: string;
  private mode: string = 'create';
  private postId: string;

  constructor(public _postsService: PostsService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] },)
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // ──────────────────────Edit Mode───────────────────────────────
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;

        this._postsService.getPost(this.postId)
          .subscribe(postData => {
            this.isLoading = false;
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath,
              creator: postData.creator
            };
            this.form.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            });
          });
      } else {
      // ──────────────────────Create Mode───────────────────────────────
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    /**Preivew Image */
    const reader = new FileReader();
    // ทำงานลำดับที่ 2
    // reader.onload is asynchronous ซึ่งอาจทำงานช้ากว่าโค้ดด้านล่าง จึงต้อง assing callback func
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    // ทำงานลำดับที่ 1
    reader.readAsDataURL(file); // this line will excute before reader.onload
  }

  onSavePost() {
    if (this.form.invalid) return;
    const title = this.form.value.title;
    const content = this.form.value.content;
    const image = this.form.value.image;
    this.isLoading = true; // not necessary turn to true in this method because after save done, we're redirect to home page.
    if (this.mode === 'create') {
      this._postsService.addPost(title, content, image);
    } else {
      this._postsService.updatePost(this.postId, title, content, image);
    }
    this.form.reset();
  }
}
