import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Topbar
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  sidebarCollapsed: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  onSidebarToggle(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
