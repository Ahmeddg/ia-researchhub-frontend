import { Routes } from '@angular/router';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { ResearcherListComponent } from './components/researcher/researcher-list/researcher-list.component';
import { DomainListComponent } from './components/domain/domain-list/domain-list.component';
import { PublicationListComponent } from './components/publication/publication-list/publication-list.component';
import { PublicationDetailComponent } from './components/publication/publication-detail/publication-detail.component';
import { ProjectListComponent } from './components/project/project-list/project-list.component';
import { NewsListComponent } from './components/news/news-list/news-list.component';
import { NewsDetailComponent } from './components/news/news-detail/news-detail.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { RoleListComponent } from './components/role/role-list/role-list.component';
import { AiOpsComponent } from './components/ai/ai-ops/ai-ops.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'news', pathMatch: 'full' },
    { path: 'home', redirectTo: 'news', pathMatch: 'full' },
    { 
        path: 'users', 
        component: UserListComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ROLE_ADMIN'] } 
    },
    { 
        path: 'roles', 
        component: RoleListComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ROLE_ADMIN'] } 
    },
    {
        path: 'ai-ops',
        component: AiOpsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'] }
    },
    { path: 'profile', component: ProfileComponent },
    { path: 'researchers', component: ResearcherListComponent },
    { path: 'domains', component: DomainListComponent },
    { path: 'publications', component: PublicationListComponent },
    { path: 'publications/:id', component: PublicationDetailComponent },
    { path: 'projects', component: ProjectListComponent },
    { path: 'news', component: NewsListComponent },
    { path: 'news/:id', component: NewsDetailComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'login', component: SignInComponent },
    { path: '**', redirectTo: 'news' }
];

