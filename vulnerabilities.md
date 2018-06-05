# Vulnerabilities

This page contains more information on found vulnarabilities in the FundRequest contracts.


## Auditors
* @davyvanroy
* @Qkyrie
* @Pauliax


## Found issues
When you find a vulnerability, please create a pull request with more information as demonstrated below.

### *Solve old issues*

#### *Auditor*
*@Pauliax*

#### *Overall Risk Severity (see [OWASP Risk Rating](https://www.owasp.org/index.php/OWASP_Risk_Rating_Methodology))*
* *Impact: Low*
* *Likelihood: Low*

#### *Proposed solution*
*Fixes https://github.com/FundRequest/contracts/issues/45*


### *Using delete on an array leaves a gap*

#### *Auditor*
*@Pauliax*

#### *Overall Risk Severity (see [OWASP Risk Rating](https://www.owasp.org/index.php/OWASP_Risk_Rating_Methodology))*
* *Impact: Low*
* *Likelihood: Low*

#### *Proposed solution*

function removePrecondition(uint _index) external onlyOwner {
    if (_index >= preconditions.length) return;
    for (uint i = _index; i < preconditions.length-1; i++) {
      preconditions[i] = preconditions[i+1];
    }
    delete preconditions[preconditions.length-1];
    preconditions.length--;
  }



