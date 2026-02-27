import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType } from '@azure/msal-browser';

import { createClaimsTable } from '../claim-utils';
import { loginRequest } from '../auth-config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  dataSource: any = [];
  displayedColumns: string[] = ['claim', 'value', 'description'];
  // Access token data
  accessToken: string | null = null;
  accessDataSource: any = [];

  /** Claims whose values are considered sensitive (PII / timestamps) */
  private readonly sensitiveClaims = new Set<string>([
    'ipaddr',
    'upn',
    'sub',
    'oid',
    'sid',
    'nonce'
  ]);

  isSensitive(claim: string): boolean {
    return this.sensitiveClaims.has(claim);
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) {
      return '[ ' + value.join(', ') + ' ]';
    }
    return value;
  }

  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) { }

  ngOnInit(): void {

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.getClaims(
          this.authService.instance.getActiveAccount()?.idTokenClaims
        );
        // Try to acquire and display an access token (if available)
        if (this.loginDisplay) {
          this.getAccessToken();
        }
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  getClaims(claims: any) {
    if (claims) {
      const claimsTable = createClaimsTable(claims);
      this.dataSource = [...claimsTable];
    }
  }

  /**
   * Acquire an access token silently and populate access token claims table
   */
  getAccessToken(): void {
    const account = this.authService.instance.getActiveAccount();
    if (!account) return;

    this.authService.acquireTokenSilent({
      scopes: loginRequest.scopes,
      account,
    }).subscribe((result: AuthenticationResult) => {
      if (result && result.accessToken) {
        this.accessToken = result.accessToken;
        const claims = this.decodeJwt(result.accessToken);
        if (claims) {
          this.accessDataSource = [...createClaimsTable(claims)];
        }
      }
    }, (error) => {
      // silent acquire may fail; ignore here — token will be acquired on-demand by guarded flows
      console.error('Failed to acquire access token silently', error);
    });
  }

  private decodeJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  signUp() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.loginPopup({
        scopes: loginRequest.scopes,
        prompt: 'create',
      })
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
    } else {
      this.authService.loginRedirect({
        scopes: loginRequest.scopes,
        prompt: 'create',
      });
    }

  }

  // unsubscribe to events when component is destroyed
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
