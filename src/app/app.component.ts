import { Component, inject } from '@angular/core';
import { Task } from './components/task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent, TaskDialogResult } from './components/task-dialog/task-dialog.component';
import { 
  Firestore, 
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = "TodoApp";
  todo!: Observable<any>;
  inProgress!: Observable<any>;
  done!: Observable<any>;

  constructor(
    private dialog: MatDialog,
    private firestore: Firestore,
  ) {
    this.getData();
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult|undefined) => {
        if (!result) {
          return;
        }
        this.addData('todo', result.task);
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult|undefined) => {
      if (!result) {
        return;
      }
      if (result.delete) {
        this.deleteData(list, task.id);
      } else {
        this.updateData(list, task.id, task);
      }
    })
  }

  drop(event: CdkDragDrop<Task[], any, any>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];

    console.log(item);

    this.deleteData(event.previousContainer.id, item.id);
    this.addData(event.container.id, item);

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  getData() {
    // Todo
    const todoCollection = collection(this.firestore, 'todo');
    this.todo = collectionData(todoCollection, { idField: 'id' });
    // InProgress  
    const inProgressCollection = collection(this.firestore, 'inProgress');
    this.inProgress = collectionData(inProgressCollection, { idField: 'id' });
    // Done
    const doneCollection = collection(this.firestore, 'done');
    this.done = collectionData(doneCollection, { idField: 'id' });
  }

  addData(col: string, data: any) {
    const collectionInstance = collection(this.firestore, col);
    addDoc(collectionInstance, data)
      .then(() => {
        console.log('Data Saved Success!');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateData(col: string, id: string|undefined, updatedData: any) {
    if (!id) return;
    const docInstance = doc(this.firestore, col, id);
    updateDoc(docInstance, updatedData)
    .then(() => {
      console.log("Data Updated!");
    })
    .catch((error) => {
      console.log(error);
    });
  }

  deleteData(col: string, id: string|undefined) {
    if (!id) return;
    const docInstance = doc(this.firestore, col, id);
    deleteDoc(docInstance)
    .then(() => {
      console.log("Data Deleted!");
    })
    .catch((error) => {
      console.log(error);
    })
  }
}
