/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A viewport limiter implementation that forbids scrolling above or below
   * the vertical bounds of the task lanes.
   * @class ViewportLimiter
   */
  class ViewportLimiter extends yfiles.view.ViewportLimiter {
    constructor(taskComponent) {
      super()
      this.taskComponent = taskComponent
    }

    /**
     * Limits the viewport to the area which contains task nodes.
     * @param {yfiles.view.CanvasComponent} canvas - The canvas control on which the viewport should be applied.
     * @param {yfiles.geometry.Rect} suggestedViewport - The suggested viewport.
     * @returns {yfiles.geometry.Rect}
     */
    limitViewport(canvas, suggestedViewport) {
      const topY = this.taskComponent.contentRect.y
      const bottomY = this.taskComponent.contentRect.bottomLeft.y
      const oldY = suggestedViewport.y
      const newY = Math.max(topY, Math.min(bottomY - suggestedViewport.height, oldY))
      return new yfiles.geometry.Rect(
        suggestedViewport.x,
        newY,
        suggestedViewport.width,
        suggestedViewport.height
      )
    }
  }

  return ViewportLimiter
})