# Vulnerabilities

This page contains more information on found vulnerabilities in the FundRequest contracts.


## Auditors
* @davyvanroy
* @Qkyrie
* @thomasvds


## Found issues
When you find a vulnerability, please create a pull request with more information as demonstrated below.

### *Example Vulnerability*

#### *Auditor*
*@thomasvds*

#### *Overall Risk Severity (see [OWASP Risk Rating](https://www.owasp.org/index.php/OWASP_Risk_Rating_Methodology))*
* *Impact: High*
* *Likelihood: High*

#### *Description*
*https://github.com/FundRequest/contracts/issues/50*

#### *Proposed solution*
*Hotfix: fix the key syntax (should be claims instead of claim). Future-proof: Use enums instead of strings as db keys*
