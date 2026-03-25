import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { ResearcherListComponent } from './components/researcher/researcher-list/researcher-list.component';
import { DomainListComponent } from './components/domain/domain-list/domain-list.component';
import { PublicationListComponent } from './components/publication/publication-list/publication-list.component';
import { ProjectListComponent } from './components/project/project-list/project-list.component';
import { NewsListComponent } from './components/news/news-list/news-list.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'users', component: UserListComponent },
    { path: 'researchers', component: ResearcherListComponent },
    { path: 'domains', component: DomainListComponent },
    { path: 'publications', component: PublicationListComponent },
    { path: 'projects', component: ProjectListComponent },
    { path: 'news', component: NewsListComponent },
    { path: '**', redirectTo: '' }
];
